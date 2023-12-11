import commons
import pytest


class TestSU:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        yield None
        self.session.logout()
    
    def test_get_all(self):
        res = self.session.request_path("GET", "/organisation")
        assert (res.ok)


class TestAdmin(commons.PersistentStore):
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
    
    def test_get_all(self):
        res = self.session.request_path("GET", "/organisation")
        assert (res.ok)
    
    def test_get_one_self_organisation(self):
        res = self.session.request_path("GET", "/organisation/info/%s" % self.session.info['organisationManaged']['UUID'])
        assert (res.ok)
    
    def test_get_one_other_organisation(self):
        res = self.session.request_path("GET", "/organisation/info/%s" % self.su_session.info['organisationManaged']['UUID'])
        assert (res.ok)
    
    def test_create_organisation(self):
        res = self.session.request_path("POST", '/organisation/create', json={'name':commons.generate_many_random_hex(1)[0]})
        assert (res.ok)
        self.store_set('tc1', res.json()['organisation'])
    
    def test_update_organisation(self):
        jsonData = {'UUID': self.store_get('tc1')['UUID'],'newName':commons.generate_many_random_hex(1, prefix='upd-')[0]}
        res = self.session.request_path("PATCH", '/organisation/update', json=jsonData)
        assert (res.ok)
    
    def test_delete_organisation(self):
        jsonData = {'UUID': self.store_get('tc1')['UUID']}
        res = self.session.request_path("DELETE", '/organisation/delete', json=jsonData)
        assert (res.ok), jsonData


class TestOrganisationManager(commons.PersistentStore):
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
    
    @pytest.mark.xfail(reason="Get all is only available to admins")
    def test_get_all(self):
        res = self.session.request_path("GET", "/organisation")
        assert (res.ok)
    
    def test_get_one_self_organisation(self):
        res = self.session.request_path("GET", "/organisation/info/%s" % self.session.info['organisationManaged']['UUID'])
        assert (res.ok)
    
    @pytest.mark.xfail(reason="User can only access its own organisation's info")
    def test_get_one_other_organisation(self):
        res = self.session.request_path("GET", "/organisation/info/%s" % self.su_session.info['organisationManaged']['UUID'])
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Only admins can create organisation")
    def test_create_organisation(self):
        res = self.session.request_path("POST", '/organisation/create', json={'name':commons.generate_many_random_hex(1)[0]})
        assert (res.ok)
        self.store_set('tc1', res.json()['organisation'])
    
    @pytest.mark.xfail(reason="Only admins can manage organisation")
    def test_update_organisation(self):
        jsonData = {'UUID': self.store_get('tc1')['UUID'], 'newName':commons.generate_many_random_hex(1, prefix='upd-')[0]}
        res = self.session.request_path("PATCH", '/organisation/update', json=jsonData)
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Only admins can delete organisation")
    def test_delete_organisation(self):
        jsonData = {'UUID': self.store_get('tc1')['UUID']}
        res = self.session.request_path("DELETE", '/organisation/delete', json=jsonData)
        assert (res.ok)


class TestPublic:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.session = commons.Session()
    
    @pytest.fixture
    def su_session(self):
        su_session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        yield su_session
        su_session.logout()
    
    @pytest.mark.xfail(reason="Authorization is required")
    def test_get_all(self):
        res = self.session.request_path("GET", "/organisation")
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Authorization is required")
    def test_get_one(self, su_session):
        res = self.session.request_path("GET", "/organisation/info/%s" % su_session.info['organisationManaged']['UUID'])
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Authorization is required")
    def test_create_organisation(self):
        res = self.session.request_path("POST", '/organisation/create', json={'name':commons.secrets.token_hex(8)})
        assert (res.ok)

    @pytest.mark.xfail(reason="Authorization is required")
    def test_update_organisation(self, su_session):
        jsonData = {'UUID': su_session.info['organisationManaged']['UUID'],'newName':commons.generate_many_random_hex(1, prefix='upd-')[0]}
        res = self.session.request_path("PATCH", '/organisation/update', json=jsonData)
        assert (res.ok)
    
    @pytest.mark.xfail(reason="Authorization is required")
    def test_delete_organisation(self, su_session):
        jsonData = {'UUID': su_session.info['organisationManaged']['UUID']}
        res = self.session.request_path("DELETE", '/organisation/delete', json=jsonData)
        assert (res.ok)
