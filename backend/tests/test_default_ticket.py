from random import randrange
import pytest
import commons
from commons import PreparedTestRequest


class Endpoint:
    base = '/invitationDefaultTicket'
    info = '%s/info/%s' % (base, '%s')
    create = '%s/create' % (base)
    update = '%s/update' % (base)
    delete = '%s/delete' % (base)

class Test:
    base = PreparedTestRequest("GET", Endpoint.base) # No base/get_all endpoint
    info = PreparedTestRequest("GET", Endpoint.info)
    create = PreparedTestRequest("POST", Endpoint.create)
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


@pytest.fixture(scope="module")
def defaults_store():
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
        generated_invitation = {'name': commons.generate_random_hex(randomLength=8), 'organisationId': client.info['organisationManaged']['UUID'], 'usageQuota': 1000}
        res1 = invitation_create_route.x(_with=client, json=generated_invitation)
        assert res1.ok
        generated_invitation.update(res1.json()['invitation'])
        invitations_store[client_role] = generated_invitation
    
    yield invitations_store
    
    for invitation in invitations_store.values():
        res3 = invitation_delete_route.x(_with=superuser, json=invitation)
        assert res3.ok


@pytest.fixture(scope="module")
def ticket(superuser):
    created_tickets=[]
    
    ticket_create_route = PreparedTestRequest("POST", '/ticket/create')
    ticket_info_route = PreparedTestRequest("POST", '/ticket/info/%s')
    ticket_delete_route = PreparedTestRequest("POST", '/ticket/delete')
    
    class Ticket:
        @staticmethod
        def create(invitationId):
            jsonData = {'ownerName': commons.generate_random_hex(randomLength=8), 'ownerContacts': [commons.generate_random_hex(randomLength=8)], 'invitationId': invitationId}
            res = ticket_create_route.x(_with=superuser, json=jsonData)
            
            jsonData.update(res.json()['ticket'])
            created_tickets.append(jsonData.copy())
            return res
        
        @staticmethod
        def get(UUID):
            res = ticket_info_route.x(_with=superuser, _path_formats=UUID)
            assert res.ok
            return res.json()['ticket']
    
    yield Ticket
    
    for ticket in created_tickets:
        res = ticket_delete_route.x(_with=superuser, json=ticket)


# Create
def test_create(all_sessions, subtests, quota_types, invitations, defaults_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Creating defaultTicket" % client_role.name):
            for creator_role, invitation in invitations.items():
                for quota_type in quota_types[:10]:
                    res = Test.create.x(_with=client, json={'quotaTypeId': quota_type['UUID'], 'value': randrange(1, 1000), 'invitationId': invitation['UUID']})
                    if quota_type['UUID'] in [default['quotaTypeId'] for default in defaults_store[creator_role]]:
                        assert not res.ok
                        continue
                    
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role>=commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        defaults_store[creator_role].append(res.json()['defaultTicket'])
                    else:
                        assert not res.ok
                        continue
                    
                    


# Get one
def test_get_one(all_sessions, subtests, defaults_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting a defaultTicket" % client_role.name):
            for creator_role, defaults in defaults_store.items():
                for default_entry in defaults:
                    res = Test.info.x(_with=client, _path_formats=default_entry['UUID'])
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role>=commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                    else:
                        assert not res.ok


# Update
def test_update(all_sessions, subtests, quota_types, defaults_store, ticket):
    K = len(quota_types)
    quota_types_updater_map = {quota_types[i%K]['UUID']: quota_types[(i+10)%K]['UUID'] for i in range(K)} # cyclic map
    
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating defaultTicket's quotaType and value" % client_role.name):
            for creator_role, defaults in defaults_store.items():
                for default_entry in defaults:
                    jsonData = default_entry.copy()
                    jsonData['quotaTypeId'] = quota_types_updater_map[default_entry['quotaTypeId']]
                    jsonData['value'] += 1
                    res = Test.update.x(_with=client, json=jsonData)
                    
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role>=commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                    else:
                        assert not res.ok
                        continue
                    
                    current_defaults = set([e['quotaTypeId'] if e!=default_entry else jsonData['quotaTypeId'] for e in defaults])
                    assert len(current_defaults)==len(defaults)
                    
                    res2 = ticket.create(default_entry['invitationId'])
                    assert res2.ok
                    
                    updated_entry_exists = False
                    for quota in res2.json()['ticket']['quotas']:
                        updated_entry_exists |= quota['quotaTypeId'] == jsonData['quotaTypeId'] and quota['usageLeft'] == jsonData['value']
                    assert updated_entry_exists
                    
                    res3 = Test.update.x(_with=client, json=default_entry)
                    assert res3.ok


# Delete
def test_delete(all_sessions, subtests, defaults_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Deleting defaultTicket" % client_role.name):
            for creator_role, defaults in defaults_store.items():
                for default_entry in defaults:
                    if default_entry.get('deleted') is not None: continue
                    res = Test.delete.x(_with=client, json=default_entry)
                    if client_role >= commons.Role.ADMIN or (creator_role==client_role and client_role>=commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        default_entry['deleted'] = 1
                    else:
                        assert not res.ok
