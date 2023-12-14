import commons
import pytest


@pytest.fixture(scope="module")
def superuser():
    superuser = commons.Session(credentials=commons.SUPERUSER_CREDENTIALS)
    yield superuser
    
    superuser.logout()

@pytest.fixture(scope="module")
def admin(superuser):
    credentials = commons.generate_create_user_input(role=commons.Role.ADMIN)
    res = superuser.request_path("POST", '/user/create', json=credentials)
    session = commons.Session(credentials=credentials)
    
    yield session
    
    session.logout()
    superuser.request_path("DELETE", '/user/delete', json=res.json()['user'])
    superuser.logout()

@pytest.fixture(scope="module")
def organisation_manager(superuser):
    credentials = commons.generate_create_user_input(role=commons.Role.ORGANISATION_MANAGER)
    res = superuser.request_path("POST", '/user/create', json=credentials)
    session = commons.Session(credentials=credentials)
    
    yield session
    
    session.logout()
    superuser.request_path("DELETE", '/user/delete', json=res.json()['user'])
    superuser.logout()

@pytest.fixture(scope="module")
def public():
    session = commons.Session()
    session.info['role'] = commons.Role.OBSERVER
    
    yield session


@pytest.fixture(scope="module")
def store():
    _store = {}

    yield _store
    
    _store.clear()