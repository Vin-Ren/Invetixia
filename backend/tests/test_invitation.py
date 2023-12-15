import pytest
import random
import commons
from commons import PreparedTestRequest


class Endpoint:
    base = '/invitation'
    
    public = '%s/public/%s' % (base, '%s')
    info = '%s/info/%s' % (base, '%s')
    
    info_tickets = '%s/info/%s/tickets' % (base, '%s')
    info_defaults = '%s/info/%s/defaults' % (base, '%s')
    
    create = '%s/create' % (base)
    update = '%s/update' % (base)
    delete = '%s/delete' % (base)

class Test:
    base = PreparedTestRequest("GET", Endpoint.base)
    
    # both public and info points to the same endpoint
    public = PreparedTestRequest("GET", Endpoint.public)
    info = PreparedTestRequest("GET", Endpoint.info)
    
    info_tickets = PreparedTestRequest("GET", Endpoint.info_tickets)
    info_defaults = PreparedTestRequest("GET", Endpoint.info_defaults)
    
    create = PreparedTestRequest("POST", Endpoint.create)
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


@pytest.fixture(scope="module")
def invitations_store():
    store = {role: [] for role in commons.Role}
    
    yield store
    
    store.clear()


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
def tickets_generator(superuser):
    created_tickets = []
    
    ticket_create_route = PreparedTestRequest("POST", '/ticket/create')
    ticket_delete_route = PreparedTestRequest("DELETE", '/ticket/delete')
    
    def _creator(invitationId, count=1):
        ress = []
        for _ in range(count):
            jsonData = {'ownerName': commons.generate_random_hex(randomLength=8), 'ownerContacts': [commons.generate_random_hex(randomLength=8)], 'invitationId': invitationId}
            res = ticket_create_route.x(_with=superuser, json=jsonData)
            if res.ok:
                created_tickets.append(res.json()['ticket'])
            ress.append(res)
        return ress

    yield _creator
    
    for ticket in created_tickets:
        res = ticket_delete_route.x(_with=superuser, json=ticket)


# Create
def test_create(all_sessions, invitations_store, tickets_store, quota_types, subtests, tickets_generator):
    K = len(quota_types)
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Creating invitation" % client_role.name):
            organisationId = client.info['organisationManaged']['UUID'] if 'organisationManaged' in client.info else 'default'
            jsonData = {'name': commons.generate_random_hex(randomLength=8), 
                        'organisationId': organisationId, 
                        'usageQuota': 1000, 
                        'defaults': []}
            
            for i in set([random.randint(K//2,K-1) for _ in range(random.randint(K//2, K-1))]):
                quota_type = quota_types[i]
                jsonData['defaults'].append({'quotaTypeId': quota_type['UUID'], 'value': random.randint(1, 100)})
            
            res = Test.create.x(_with=client, json=jsonData)
            
            if client_role >= commons.Role.ORGANISATION_MANAGER:
                assert res.ok
                jsonData.update(res.json()['invitation'])
                invitations_store[client_role].append(jsonData.copy())
            else:
                assert not res.ok
                continue
            
            res2_list = tickets_generator(res.json()['invitation']['UUID'], random.randint(4,10))
            tickets_store[client_role] = [res2.json()['ticket'] for res2 in res2_list]
            for ticket in tickets_store[client_role]:
                assert ticket['ownerAffiliationId'] == jsonData['organisationId']
                
                mapped_quotas = {quota['quotaTypeId']: quota['usageLeft'] for quota in ticket['quotas']}
                assert len(ticket['quotas']) == len(jsonData['defaults'])
                for default_entry in jsonData['defaults']:
                    assert mapped_quotas[default_entry['quotaTypeId']] == default_entry['value']
            
            invitations_store[client_role][0]['createdTicketCount'] = len(tickets_store[client_role])
            invitations_store[client_role][0]['defaultCount'] = len(jsonData['defaults'])


# Get all
def test_get_all(all_sessions, subtests):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting all invitations" % client_role.name):
            
            res = Test.base.x(_with=client)
            
            if client_role >= commons.Role.ADMIN:
                assert res.ok
            else:
                assert not res.ok
                continue


# Get one (public)
def test_get_one_public(all_sessions, subtests, invitations_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting a invitation (public)" % client_role.name):
            for invitations in invitations_store.values():
                for invitation in invitations:
                    res = Test.public.x(_with=client, _path_formats=invitation['UUID'])
                    
                    assert res.ok
                    data = res.json()['invitation']
                    assert 'managers' not in data['publisher']
                    assert all([k not in data for k in ['createdTicketCount', 'createdTime', 'defaults']])


# Get one
def test_get_one(all_sessions, subtests, invitations_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting a invitation" % client_role.name):
            for creator_role, invitations in invitations_store.items():
                for invitation in invitations:
                    res = Test.info.x(_with=client, _path_formats=invitation['UUID'])
                    
                    if client_role >= commons.Role.ADMIN or (creator_role == client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        data = res.json()['invitation']
                        assert 'managers' in data['publisher']
                        assert all([k in data for k in ['createdTicketCount', 'createdTime', 'defaults']])
                    else:
                        assert not res.ok


# Get createdTickets
def test_get_tickets(all_sessions, subtests, invitations_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting invitation's createdTickets" % client_role.name):
            for creator_role, invitations in invitations_store.items():
                for invitation in invitations:
                    res = Test.info_tickets.x(_with=client, _path_formats=invitation['UUID'])
                    
                    if client_role >= commons.Role.ADMIN or (creator_role == client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        data = res.json()['tickets']
                        assert len(data) == invitations_store[creator_role][0]['createdTicketCount']
                        for ticket in data:
                            assert all([k in ticket for k in ['UUID', 'ownerName', 'ownerContacts', 'createdTime', 'ownerAffiliation', 'quotas']])
                            for quota in ticket['quotas']:
                                assert all([k in quota for k in ['UUID', 'quotaType', 'quotaTypeId', 'usageLeft', 'ticketId']])
                    else:
                        assert not res.ok


# Get defaults
def test_get_defaults(all_sessions, subtests, invitations_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting invitation's defaults" % client_role.name):
            for creator_role, invitations in invitations_store.items():
                for invitation in invitations:
                    res = Test.info_defaults.x(_with=client, _path_formats=invitation['UUID'])
                    
                    if client_role >= commons.Role.ADMIN or (creator_role == client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        data = res.json()['defaults']
                        assert len(data) == invitations_store[creator_role][0]['defaultCount']
                        for default_entry in data:
                            assert all([k in default_entry for k in ['UUID', 'invitationId', 'quotaTypeId', 'quotaType', 'value']])
                            assert all([k in default_entry['quotaType'] for k in ['UUID', 'name', 'description']])
                    else:
                        assert not res.ok


# Update
def test_update(all_sessions, subtests, invitations_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating invitation" % client_role.name):
            for creator_role, invitations in invitations_store.items():
                for invitation in invitations:
                    jsonData = invitation.copy()
                    jsonData['name'] = commons.generate_random_hex('upd-', 8)
                    jsonData['organisationId'] = client.info['organisationManaged']['UUID'] if 'organisationManaged' in client.info else 'default'
                    jsonData['newUsageQuota'] = random.randint(1,500)
                    res = Test.update.x(_with=client, json=jsonData)
                    
                    if client_role >= commons.Role.ADMIN or (creator_role == client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        data = res.json()['invitation']
                        assert all([k in data for k in ['createdTicketCount', 'createdTime', 'defaults']])
                    else:
                        assert not res.ok
                        continue
                    
                    # Reverting changes
                    res2 = Test.update.x(_with=client, json={**invitation, 'newUsageQuota': invitation['usageQuota']})
                    assert res2.ok


# Delete
def test_delete(all_sessions, subtests, invitations_store):
    for client in all_sessions:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Deleting invitation" % client_role.name):
            for creator_role, invitations in invitations_store.items():
                for invitation in invitations:
                    if invitation.get('deleted') is not None: continue
                    res = Test.delete.x(_with=client, json=invitation)
                    if client_role >= commons.Role.ADMIN or (creator_role == client_role and client_role >= commons.Role.ORGANISATION_MANAGER):
                        assert res.ok
                        invitation['deleted'] = 1
                    else:
                        assert not res.ok
                        continue
