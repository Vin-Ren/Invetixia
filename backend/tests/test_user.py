import pytest
import commons
from commons import PreparedTestRequest


class Endpoint:
    base = '/user'
    roles = '%s/roles' % base
    
    info = '%s/info/%s' % (base, '%s')
    self = '%s/self' % base
    
    login = '%s/login' % base
    logout = '%s/logout' % base
    changePassword = '%s/changePassword' % base
    refreshToken = '%s/refreshToken' % base
    
    create = '%s/create' % base
    update = '%s/update' % base
    delete = '%s/delete' % base

class Test:
    base = PreparedTestRequest("GET", Endpoint.base)
    roles = PreparedTestRequest("GET", Endpoint.roles)
    
    info = PreparedTestRequest("GET", Endpoint.info)
    self = PreparedTestRequest("GET", Endpoint.self)
    
    login = PreparedTestRequest("POST", Endpoint.login)
    logout = PreparedTestRequest("POST", Endpoint.logout)
    changePassword = PreparedTestRequest("PATCH", Endpoint.changePassword)
    refreshToken = PreparedTestRequest("GET", Endpoint.refreshToken)
    
    create = PreparedTestRequest("POST", Endpoint.create)
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


@pytest.fixture(scope="module")
def users_store():
    users = {role.value: [] for role in commons.Role}
    yield users
    users.clear()


# Roles
def test_get_roles(superuser, admin, organisation_manager, public, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Get roles" % client_role.name):
            res = Test.roles.x(_with=client)
            assert res.ok


# Create
def test_create(superuser, admin, organisation_manager, public, users_store, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Creating user" % client_role.name):
            for role in commons.Role:
                generated_data = commons.generate_create_user_input(role=role)
                res = Test.create.x(_with=client, json=generated_data)
                
                if client_role >= commons.Role.ADMIN and client_role > role:
                    assert res.ok, (res)
                    generated_data.update(res.json()['user'])
                    users_store[role].append(generated_data.copy())
                else:
                    assert not res.ok, (res)


# Get all
def test_get_all(superuser, admin, organisation_manager, public, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Get all" % client_role.name):
            res = Test.base.x(_with=client)
            if client_role < commons.Role.ADMIN:
                assert not res.ok
                pytest.xfail(reason="Requires at least admin privileges. (client_role='%s')" % (client_role.name))
            else:
                assert res.ok
                for user in res.json()['users']:
                    assert user['role']<client_role, user


# Get one
def test_get_one(superuser, admin, organisation_manager, public, users_store, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting user" % client_role.name):
            for target in [superuser.info, admin.info, users_store[commons.Role.ORGANISATION_MANAGER][0], users_store[commons.Role.OBSERVER][0]]:
                res = Test.info.x(_with=client, _path_formats=target['UUID'])
                
                if client_role < commons.Role.ADMIN:
                    assert not res.ok, (target, res)
                else:
                    assert res.ok, (target, res)


# Get self
def test_get_self(superuser, admin, organisation_manager, subtests):
    for client in [superuser, admin, organisation_manager]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Getting user self" % client_role.name):
            res = Test.self.x(_with=client)
            assert res.ok


# changePassword
def test_change_password(superuser, admin, organisation_manager, subtests):
    for client in [superuser, admin, organisation_manager]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Changing user password" % client_role.name):
            oldPass = client.credentials['password']
            newPass = commons.generate_random_hex(randomLength=16)
            client.credentials['password'] = newPass
            res = Test.changePassword.x(_with=client, json={'password':oldPass, 'newPassword': newPass})
            assert res.ok
            assert client.reauth()
            
            res2 = Test.self.x(_with=client)
            assert res2.ok
            
            client.credentials['password'] = oldPass
            res3 = Test.changePassword.x(_with=client, json={'password': newPass, 'newPassword': oldPass})
            assert res3.ok
            assert client.reauth()


# refreshToken
def test_refreshToken(superuser, admin, organisation_manager, subtests):
    for client in [superuser, admin, organisation_manager]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': refreshing accessToken" % client_role.name):
            client.headers['Authorization'] = ''
            res = Test.refreshToken.x(_with=client)
            assert res.ok
            
            client.headers['Authorization'] = f'Bearer {res.json()["accessToken"]}'
            res2 = Test.self.x(_with=client)
            assert res2.ok



# Update - username
def test_update_username(superuser, admin, organisation_manager, public, users_store, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating users username" % client_role.name):
            for target in [superuser.info, users_store[commons.Role.ADMIN][0], users_store[commons.Role.ORGANISATION_MANAGER][0], users_store[commons.Role.OBSERVER][0]]:
                target_original_role = commons.Role(target['role'])
                
                jsonData = target.copy()
                jsonData['username'] = commons.generate_random_hex(prefix='upd-', randomLength=16)
                res = Test.update.x(_with=client, json=jsonData)
                
                if client_role < commons.Role.ADMIN or client_role <= target_original_role:
                    assert not res.ok, (jsonData, res)
                else:
                    assert res.ok, (jsonData, res)
                
                if client_role > target_original_role: # Reverting changes if changed
                    res = Test.update.x(_with=client, json=target)


# Update - Assign roles
def test_update_roles(superuser, admin, organisation_manager, public, users_store, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating users roles" % client_role.name):
            for target in [superuser.info, users_store[commons.Role.ADMIN][0], users_store[commons.Role.ORGANISATION_MANAGER][0], users_store[commons.Role.OBSERVER][0]]:
                target_original_role = commons.Role(target['role'])
                for new_role in commons.Role:
                    jsonData = target.copy()
                    jsonData['role'] = new_role
                    res = Test.update.x(_with=client, json=jsonData)
                    
                    if client_role < commons.Role.ADMIN or client_role <= max(target_original_role, new_role):
                        assert not res.ok, (jsonData, res)
                    else:
                        assert res.ok, (jsonData, res)
                
                if client_role > target_original_role: # Reverting changes if changed
                    res = Test.update.x(_with=client, json=target)


# Update - Organisation
def test_update_organisation(superuser, admin, organisation_manager, public, users_store, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating users organisation" % client_role.name):
            for target in [superuser.info, users_store[commons.Role.ADMIN][0], users_store[commons.Role.ORGANISATION_MANAGER][0], users_store[commons.Role.OBSERVER][0]]:
                target_original_role = commons.Role(target['role'])
                
                jsonData = target.copy()
                jsonData['organisationName'] = commons.generate_random_hex(prefix='upd-', randomLength=16)
                res = Test.update.x(_with=client, json=jsonData)
                
                if client_role < commons.Role.ADMIN or client_role <= target_original_role:
                    assert not res.ok, (jsonData, res)
                else:
                    assert res.ok, (jsonData, res)
                
                if client_role > target_original_role: # Reverting changes if changed
                    res = Test.update.x(_with=client, json=target)


# Update - password
def test_update_password(superuser, admin, organisation_manager, public, users_store, subtests):
    for client in [superuser, admin, organisation_manager, public]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Updating users password" % client_role.name):
            for target in [superuser.info, users_store[commons.Role.ADMIN][0], users_store[commons.Role.ORGANISATION_MANAGER][0], users_store[commons.Role.OBSERVER][0]]:
                target_original_role = commons.Role(target['role'])
                
                jsonData = target.copy()
                jsonData['password'] = commons.generate_random_hex(prefix='upd-', randomLength=16)
                res = Test.update.x(_with=client, json=jsonData)
                
                sess = commons.Session()
                sess.credentials=jsonData
                
                if client_role < commons.Role.ADMIN or client_role <= target_original_role:
                    assert (not res.ok) and (not sess.login()), (jsonData, res)
                else:
                    assert res.ok and sess.login(), (jsonData, res)
                    sess.logout()
                
                if client_role > target_original_role: # Reverting changes if changed
                    res = Test.update.x(_with=client, json=target)


# Delete along with clean up
def test_delete_all_users(superuser, admin, organisation_manager, public, subtests):
    for client in [public, organisation_manager, admin, superuser]:
        client_role = commons.Role(client.info['role'])
        with subtests.test(msg="'%s': Deleting users" % client_role.name):
            get_all_res = Test.base.x(_with=client)
            if client_role < commons.Role.ADMIN:
                assert not get_all_res.ok
                continue
            
            for user in get_all_res.json()['users']:
                del_res = Test.delete.x(_with=client, json={'UUID': user['UUID']})
                assert del_res.ok, (user, del_res)
