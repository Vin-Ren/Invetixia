import commons
import pytest


class TestSU:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.session = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
        yield None
        self.session.logout()
    
    def test_get_info(self):
        res = self.session.request_path("GET", '/event')
        assert (res.ok)


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
    
    def test_get_info(self):
        res = self.session.request_path("GET", '/event')
        assert (res.ok)


class TestPublic:
    @pytest.fixture(autouse=True)
    def _login(self):
        self.session = commons.Session()
    
    def test_get_info(self):
        res = self.session.request_path("GET", '/event')
        assert (res.ok)
