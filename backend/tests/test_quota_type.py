import pytest
from sessions import superuser, admin, organisation_manager, public
import commons
from commons import PreparedTestRequest


store = commons.PS

class Endpoint:
    base = '/quotaType'
    info = '%s/info/%s' % (base, '%s')
    create = '%s/create' % (base)
    update = '%s/update' % (base)
    delete = '%s/delete' % (base)

class Test:
    base = PreparedTestRequest("GET", Endpoint.base)
    info = PreparedTestRequest("GET", Endpoint.info)
    create = PreparedTestRequest("POST", Endpoint.create)
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


# create
def test_superuser_create_one(superuser):
    res = Test.create.x(_with=superuser, json={'name': commons.secrets.token_hex(8)})
    store['su']=res.json()['quotaType']
    assert res.ok

def test_admin_create_one(admin):
    res = Test.create.x(_with=admin, json={'name': commons.secrets.token_hex(8)})
    store['admin']=res.json()['quotaType']
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_create_one(organisation_manager):
    res = Test.create.x(_with=organisation_manager, json={'name': commons.secrets.token_hex(8)})
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_create_one(public):
    res = Test.create.x(_with=public, json={'name': commons.secrets.token_hex(8)})
    assert res.ok


# get all
def test_admin_get_all(admin):
    res = Test.base.x(_with=admin)
    assert res.ok, admin.info

def test_organisation_manager_get_all(organisation_manager):
    res = Test.base.x(_with=organisation_manager)
    assert res.ok

def test_public_get_all(public):
    res = Test.base.x(_with=public)
    assert res.ok


# get one
def test_admin_get_one(admin):
    Test.info.path %= store['su']['UUID']
    res = Test.info.x(_with=admin)
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_get_one(organisation_manager):
    res = Test.info.x(_with=organisation_manager)
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_get_one(public):
    res = Test.info.x(_with=public)
    assert res.ok


# update 
def test_superuser_update(superuser):
    jsonPayload = {"UUID": store['su']['UUID'], "name": commons.secrets.token_hex(8), "description": commons.secrets.token_hex(16)}
    res = Test.update.x(_with=superuser, json=jsonPayload)
    assert res.ok

def test_admin_update(admin):
    jsonPayload = {"UUID": store['su']['UUID'], "name": commons.secrets.token_hex(8), "description": commons.secrets.token_hex(16)}
    res = Test.update.x(_with=admin, json=jsonPayload)
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_update(organisation_manager):
    jsonPayload = {"UUID": store['su']['UUID'], "name": commons.secrets.token_hex(8), "description": commons.secrets.token_hex(16)}
    res = Test.update.x(_with=organisation_manager, json=jsonPayload)
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_update(public):
    jsonPayload = {"UUID": store['su']['UUID'], "name": commons.secrets.token_hex(8), "description": commons.secrets.token_hex(16)}
    res = Test.update.x(_with=public, json=jsonPayload)
    assert res.ok


# delete
def test_superuser_delete(superuser):
    res = Test.delete.x(_with=superuser, json={"UUID": store['su']['UUID']})
    assert res.ok

def test_admin_delete(admin):
    res = Test.delete.x(_with=admin, json={"UUID": store['admin']['UUID']})
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_delete(organisation_manager):
    res = Test.delete.x(_with=organisation_manager, json={"UUID": store['su']['UUID']})
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_delete(public):
    res = Test.delete.x(_with=public, json={"UUID": store['su']['UUID']})
    assert res.ok
