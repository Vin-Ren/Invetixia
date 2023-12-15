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
def observer(superuser):
    credentials = commons.generate_create_user_input(role=commons.Role.OBSERVER)
    res = superuser.request_path("POST", '/user/create', json=credentials)
    session = commons.Session(credentials=credentials)
    
    yield session
    
    session.logout()
    superuser.request_path("DELETE", '/user/delete', json=res.json()['user'])
    superuser.logout()

@pytest.fixture(scope="module")
def public():
    session = commons.Session()
    session.info['role'] = commons.Role.PUBLIC
    
    yield session


@pytest.fixture(scope="module")
def manager_sessions(superuser, admin, organisation_manager):
    session_list = [organisation_manager, admin, superuser]
    yield session_list

@pytest.fixture(scope="module")
def authenticated_sessions(manager_sessions, observer):
    session_list = [observer] + manager_sessions
    yield session_list

@pytest.fixture(scope="module")
def all_sessions(authenticated_sessions, public):
    session_list = [public] + authenticated_sessions
    yield session_list


@pytest.fixture(scope="module")
def store():
    _store = {}

    yield _store
    
    _store.clear()
