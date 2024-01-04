import pytest
import commons
from commons import PreparedTestRequest


class Endpoint:
    base = '/ticket'
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
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


@pytest.fixture(scope="module")
def tickets_store():
    store = {role: [] for role in commons.Role}
    
    yield store
    
    store.clear()


@pytest.fixture(scope="module")
def quota_types(superuser):
    quota_types_store = []
    
    quota_type_create_route = PreparedTestRequest("POST", '/quotaType/create')
    quota_type_delete_route = PreparedTestRequest("DELETE", '/quotaType/delete')
    for _ in range(10):
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
        generated_invitation = {'name': commons.generate_random_hex(randomLength=8), 'organisationId': client.info['organisationManaged']['UUID'], 'usageQuota': 1000}
        res1 = invitation_create_route.x(_with=client, json=generated_invitation)
        assert res1.ok
        generated_invitation.update(res1.json()['invitation'])
        invitations_store[client_role] = generated_invitation
    
    yield invitations_store
    
    for invitation in invitations_store.values():
        res3 = invitation_delete_route.x(_with=superuser, json=invitation)
        assert res3.ok


# Create
def test_create(all_sessions, tickets_store, subtests, invitations):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Creating ticket" % client_role.name):
            for creator_role, invitation in invitations.items():
                jsonData = {'ownerName': commons.FAKE.unique.name(), 
                            'ownerContacts': {'email': commons.FAKE.unique.email(), 'phone_number': commons.FAKE.unique.msisdn()}, 
                            'invitationId': invitation['UUID']}
                res = Test.create.x(_with=client, json=jsonData)
                
                assert res.ok, jsonData
                tickets_store[creator_role].append(res.json()['ticket'])


# Get all
def test_get_all(all_sessions, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting all ticket" % client_role.name):
            res = Test.base.x(_with=client)
            
            if client_role >= commons.Role.ADMIN:
                assert res.ok
            else:
                assert not res.ok


# Get one (always public)
def test_get_one(all_sessions, tickets_store, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting a ticket" % client_role.name):
            for tickets in tickets_store.values():
                for ticket in tickets:
                    res = Test.info.x(_with=client, _path_formats=ticket['UUID'])
                    assert res.ok


# Update (always public)
def test_update(all_sessions, tickets_store, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating ticket" % client_role.name):
            for tickets in tickets_store.values():
                for ticket in tickets:
                    jsonData = ticket.copy()
                    jsonData['ownerName'] = commons.FAKE.unique.name()
                    jsonData['ownerContacts'] = {'email': commons.FAKE.unique.email(), 'phone_number': commons.FAKE.unique.msisdn()}
                    res = Test.update.x(_with=client, json=jsonData)
                    assert res.ok
                    resData = res.json()['ticket']
                    assert resData['ownerName'] == jsonData['ownerName']
                    assert resData['ownerContacts'] == jsonData['ownerContacts']
                    
                    # Reverting changes
                    res = Test.update.x(_with=client, json=ticket)
                    assert res.ok


# Delete
def test_delete(all_sessions, tickets_store, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Deleting ticket" % client_role.name):
            for creator_role, tickets in tickets_store.items():
                for ticket in tickets:
                    if ticket.get('deleted') is not None: continue
                    res = Test.delete.x(_with=client, json=ticket)
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        ticket['deleted']=1
                    else:
                        assert not res.ok
