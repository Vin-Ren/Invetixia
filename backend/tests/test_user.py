import commons
import pytest


# Test Super User
class TestSU:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.K = 3
        self.session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        
        self.generated_admin_data = commons.generate_many_create_user_input(commons.Role.ADMIN, self.K)
        self.admin_sessions = [commons.Session() for i in range(self.K)]
        
        yield None
        
        self.session.logout()
    
    def test_create_admins(self, subtests):
        for i in range(self.K):
            with subtests.test("Create and Authenticate admin", i=i):
                res = self.session.request_path("POST", '/user/create', json=self.generated_admin_data[i])
                self.generated_admin_data[i].update(res.json()['user'])
                self.admin_sessions[i].login(self.generated_admin_data[i])
    
    # @pytest.mark.xfail(reason="User can only manage roles below itself")
    def test_assign_super_admin_to_admin_xfail(self, subtests):
        for i in range(self.K):
            with subtests.test(msg="Assign super admin role to admin", i=i):
                self.generated_admin_data[i]['role']=8
                res = self.admin_sessions[i].request_path("PATCH", '/user/update', json=self.generated_admin_data[i])
                assert (res.status_code==403), "Should be 403"
                pytest.xfail("User can only manage roles below itself")
    
    def test_delete_all_users(self, subtests):
        users = []
        with subtests.test("Getting users"):
            res = self.session.request_path("GET", '/user')
            users = res.json()['users']
        
        for i, user in enumerate(users):
            if user['UUID']==self.session.info['UUID']: continue
            
            with subtests.test("Delete user", i=i):
                res = self.session.request_path("DELETE", '/user/delete', json=user)
                assert res.ok, "Should be able to delete every user except itself"


class TestAdmin:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.su_session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        self.credentials = commons.generate_create_user_input(role=commons.Role.ADMIN)
        res = self.su_session.request_path("POST", '/user/create', json=self.credentials)
        self.session = commons.Session(credentials=self.credentials)
        
        yield None
        
        self.session.logout()
        self.su_session.request_path("DELETE", '/user/delete', json=res.json()['user'])
        self.su_session.logout()
    
    def test_get_users(self):
        res = self.session.request_path("GET", '/user')
        assert (res.ok)
    
    def test_get_super_user(self):
        res = self.session.request_path("GET", '/user/info/%s' % self.su_session.info['UUID'])
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Admin cannot delete superadmin")
    def test_delete_superuser(self):
        res = self.session.request_path("DELETE", '/user/delete', json={'UUID': self.session.info['UUID']})
        assert (res.ok), "Should fail"
    
    def test_change_password_normal(self):
        res = self.session.request_path("PATCH", '/user/changePassword', json={'password':self.credentials['password'], 'newPassword':'12345678'})
        assert (res.ok)
    
    def test_change_password_admin(self):
        res = self.session.request_path("PATCH", '/user/changePassword', json={'newPassword':'12345678'})
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Admin cannot modify superadmin")
    def test_change_super_user_role(self):
        updated_data = self.su_session.info.copy();
        updated_data['role'] = 1
        res = self.session.request_path("PATCH", '/user/update', json=updated_data)
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Updates on a user can only be done by a higher roled user")
    def test_change_organisation(self):
        updated_data = self.session.info.copy();
        updated_data['organisationName'] = 'default'
        res = self.session.request_path("PATCH", '/user/update', json=updated_data)
        assert (res.ok) 
    
    def test_refreshToken(self):
        res = self.session.request_path("GET", '/user/refreshToken')
        assert (res.ok)
        self.session.headers['Authorization'] = f'Bearer {res.json()["accessToken"]}'

        res = self.session.request_path("GET", '/user/self')
        assert (res.json()['user']['UUID']==self.session.info['UUID'])


class TestOrganisationManager:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.su_session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        self.credentials = commons.generate_create_user_input(role=commons.Role.ORGANISATION_MANAGER)
        res = self.su_session.request_path("POST", '/user/create', json=self.credentials)
        self.session = commons.Session(credentials=self.credentials)
        
        yield None
        
        self.session.logout()
        self.su_session.request_path("DELETE", '/user/delete', json=res.json()['user'])
        self.su_session.logout()
    
    def test_get_users(self):
        res = self.session.request_path("GET", '/user')
        for e in res.json()['users']:
            assert e['role']<self.session.info['role'], "Should only be able to query users with lower role"
    
    @pytest.mark.xfail(reason="Only Admins can get admin and super admin roled users")
    def test_get_super_user(self):
        res = self.session.request_path("GET", '/user/info/%s' % self.su_session.info['UUID'])
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Organisation manager cannot delete superadmin")
    def test_delete_superuser(self):
        res = self.session.request_path("DELETE", '/user/delete', json={'UUID': self.session.info['UUID']})
        assert (res.ok), "Should fail"
    
    def test_change_password_normal(self):
        res = self.session.request_path("PATCH", '/user/changePassword', json={'password':self.credentials['password'], 'newPassword':'12345678'})
        assert (res.ok)
    
    @pytest.mark.xfail(reason="This method of changing password is only for admin roled user")
    def test_change_password_admin(self):
        res = self.session.request_path("PATCH", '/user/changePassword', json={'newPassword':'12345678'})
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Organisation manager cannot modify superadmin")
    def test_change_super_user_role(self):
        updated_data = self.su_session.info.copy();
        updated_data['role'] = 1
        res = self.session.request_path("PATCH", '/user/update', json=updated_data)
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Updates on a user can only be done by a higher roled user")
    def test_change_organisation(self):
        updated_data = self.session.info.copy();
        updated_data['organisationName'] = 'default'
        res = self.session.request_path("PATCH", '/user/update', json=updated_data)
        assert (res.ok) 
    
    def test_refreshToken(self):
        res = self.session.request_path("GET", '/user/refreshToken')
        assert (res.ok)
        self.session.headers['Authorization'] = f'Bearer {res.json()["accessToken"]}'

        res = self.session.request_path("GET", '/user/self')
        assert (res.json()['user']['UUID']==self.session.info['UUID'])


class TestPublic:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.session = commons.Session()
    
    @pytest.fixture
    def su_session(self):
        su_session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        yield su_session
        su_session.logout()
    
    def test_get_roles(self):
        res = self.session.request_path("GET", '/user/roles')
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Authorization is required")
    def test_user_all(self):
        res = self.session.request_path("GET", '/user')
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Authorization is required")
    def test_user_one(self, su_session):
        res = self.session.request_path("GET", '/user/info/%s' % su_session.info['UUID'])
        assert (res.ok)

    @pytest.mark.xfail(reason="Authorization is required")
    def test_create_user(self):
        res = self.session.request_path("POST", '/user/create', json=commons.generate_create_user_input(role=commons.Role.OBSERVER))
        assert (res.ok)
