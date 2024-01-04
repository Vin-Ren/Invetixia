import pytest
import commons
from commons import PreparedTestRequest


class Endpoint:
    base = '/quota'
    public = '%s/public/%s' % (base, '%s')
    info = '%s/info/%s' % (base, '%s')
    create = '%s/create' % (base)
    consume = '%s/consume' % (base)
    update = '%s/update' % (base)
    delete = '%s/delete' % (base)

class Test:
    base = PreparedTestRequest("GET", Endpoint.base)
    
    # both public and info points to the same endpoint
    public = PreparedTestRequest("GET", Endpoint.public)
    info = PreparedTestRequest("GET", Endpoint.info)
    
    create = PreparedTestRequest("POST", Endpoint.create)
    consume = PreparedTestRequest("POST", Endpoint.consume)
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


@pytest.fixture(scope="module")
def quotas_store():
    store = {role: [] for role in commons.Role}
    
    yield store
    
    store.clear()


@pytest.fixture(scope="module")
def quota_types(superuser):
    quota_types_store = []
    
    quota_type_create_route = PreparedTestRequest("POST", '/quotaType/create')
    quota_type_delete_route = PreparedTestRequest("DELETE", '/quotaType/delete')
    for _ in range(20):
        jsonData = {'name': commons.generate_random_hex(randomLength=8)}
        res = quota_type_create_route(_with=superuser, json=jsonData)
        assert res.ok
        jsonData.update(res.json()['quotaType'])
        quota_types_store.append(jsonData.copy())
    
    yield quota_types_store
    
    for quota_type in quota_types_store:
        res2 = quota_type_delete_route(_with=superuser, json=quota_type)
        assert res2.ok


@pytest.fixture(scope="module")
def invitations(manager_sessions, superuser):
    invitations_store = {}
    
    invitation_create_route = PreparedTestRequest("POST", '/invitation/create')
    invitation_delete_route = PreparedTestRequest("DELETE", '/invitation/delete')
    
    for client in manager_sessions:
        client_role = commons.Role(client.info['role'])
        generated_invitation = {'name': commons.generate_random_hex(randomLength=8), 'organisationId': client.info['organisationManaged']['UUID'], 'usageQuota': 1}
        res1 = invitation_create_route.x(_with=client, json=generated_invitation)
        assert res1.ok
        generated_invitation.update(res1.json()['invitation'])
        invitations_store[client_role] = generated_invitation
    
    yield invitations_store
    
    for invitation in invitations_store.values():
        res3 = invitation_delete_route.x(_with=superuser, json=invitation)
        assert res3.ok


@pytest.fixture(scope="module")
def tickets(superuser, invitations):
    tickets_store = {}
    
    ticket_create_route = PreparedTestRequest("POST", '/ticket/create')
    
    for creator_role, invitation in invitations.items():
        jsonData = {'ownerName': commons.FAKE.unique.name(), 
                    'ownerContacts': {'email': commons.FAKE.unique.email(), 'phone_number': commons.FAKE.unique.msisdn()}, 
                    'invitationId': invitation['UUID']}
        res = ticket_create_route.x(_with=superuser, json=jsonData)
        assert res.ok
        
        jsonData.update(res.json()['ticket'])
        tickets_store[creator_role] = jsonData
    
    yield tickets_store
    # Deletion handled by invitations fixture


# Create
def test_create(all_sessions, quotas_store, subtests, quota_types, tickets):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Creating quota" % client_role.name):
            for creator_role, ticket in tickets.items():
                for quota_type in quota_types[:10]:
                    jsonData = {'quotaTypeId': quota_type['UUID'], 'usageLeft': 2, 'ticketId': ticket['UUID']}
                    res = Test.create.x(_with=client, json=jsonData)
                    
                    if quota_type['UUID'] in [quota['quotaTypeId'] for quota in quotas_store[creator_role]]:
                        assert not res.ok
                        continue
                    
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role>=commons.Role.ORGANISATION_MANAGER):
                        assert res.ok, jsonData
                        quotas_store[creator_role].append(res.json()['quota'])
                    else:
                        assert not res.ok


# Get all
def test_get_all(all_sessions, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting all quota" % client_role.name):
            res = Test.base.x(_with=client)
            if client_role>=commons.Role.ADMIN:
                assert res.ok
            else:
                assert not res.ok


# Get one (always public)
def test_get_one_public(all_sessions, quotas_store, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting a specific quota" % client_role.name):
            for quotas in quotas_store.values():
                for quota in quotas:
                    res = Test.info.x(_with=client, _path_formats=quota['UUID'])
                    assert res.ok


# Consume
def test_consume(all_sessions, quotas_store, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Consuming quota" % client_role.name):
            for creator_role, quotas in quotas_store.items():
                for idx, quota in enumerate(quotas):
                    for _ in range(quota['usageLeft']):
                        res = Test.consume.x(_with=client, json={'UUID': quota['UUID']})
                        if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                            assert res.ok
                        else:
                            assert not res.ok
                    
                    # After quota is exhausted, should fail
                    res = Test.consume.x(_with=client, json={'UUID': quota['UUID']})
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert not res.ok
                        quotas_store[creator_role][idx]['usageLeft'] = 0
                    else:
                        assert not res.ok


# Update - quotaType
def test_update_quota_type(all_sessions, quotas_store, subtests, quota_types):
    K = len(quota_types)
    quota_types_updater_map = {quota_types[i%K]['UUID']: quota_types[(i+10)%K]['UUID'] for i in range(K)} # cyclic map
    
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating quotaType" % client_role.name):
            for creator_role, quotas in quotas_store.items():
                for quota in quotas:
                    jsonData = quota.copy()
                    jsonData['quotaTypeId'] = quota_types_updater_map[jsonData['quotaTypeId']]
                    res = Test.update.x(_with=client, json=jsonData)
                    if (creator_role==client_role and client_role >= commons.Role.ORGANISATION_MANAGER) or client_role>=commons.Role.ADMIN:
                        assert res.ok
                    else:
                        assert not res.ok
                    
                    # Revert change
                    res2 = Test.update.x(_with=client, json=quota)
                    if (creator_role==client_role and client_role >= commons.Role.ORGANISATION_MANAGER) or client_role>=commons.Role.ADMIN:
                        assert res2.ok
                    else:
                        assert not res2.ok


# Update - usageLeft
def test_update_usageLeft(all_sessions, quotas_store, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating usageLeft" % client_role.name):
            for creator_role, quotas in quotas_store.items():
                for quota in quotas:
                    jsonData = quota.copy()
                    jsonData['usageLeft'] = 1
                    res = Test.update.x(_with=client, json=jsonData)
                    if (creator_role==client_role and client_role >= commons.Role.ORGANISATION_MANAGER) or client_role>=commons.Role.ADMIN:
                        assert res.ok
                    else:
                        assert not res.ok
                        continue
                    
                    res2 = Test.consume.x(_with=client, json={'UUID': quota['UUID']})
                    assert res2.ok
                    
                    # Revert change
                    res3 = Test.update.x(_with=client, json=quota)
                    assert res3.ok
