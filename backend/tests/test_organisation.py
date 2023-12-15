import pytest
import commons
from commons import PreparedTestRequest


class Endpoint:
    base = '/organisation'
    info = '%s/info/%s' % (base, '%s')
    infoManagers = '%s/info/%s/managers' % (base, '%s')
    infoInvitations = '%s/info/%s/invitations' % (base, '%s')
    infoTickets = '%s/info/%s/tickets' % (base, '%s')
    create = '%s/create' % base
    update = '%s/update' % base
    delete = '%s/delete' % base

class Test:
    base = PreparedTestRequest("GET", Endpoint.base)
    info = PreparedTestRequest("GET", Endpoint.info)
    infoManagers = PreparedTestRequest("GET", Endpoint.infoManagers) # TBA
    infoInvitations = PreparedTestRequest("GET", Endpoint.infoInvitations) # TBA
    infoTickets = PreparedTestRequest("GET", Endpoint.infoTickets) # TBA
    create = PreparedTestRequest("POST", Endpoint.create)
    update = PreparedTestRequest("PATCH", Endpoint.update)
    delete = PreparedTestRequest("DELETE", Endpoint.delete)


# Create
def test_superuser_create_organisation(superuser, store):
    res = Test.create.execute(_with=superuser, json={'name':commons.generate_random_hex()})
    assert res.ok
    store['org1'] = res.json()['organisation']

def test_admin_create_organisation(admin, store):
    res = Test.create.execute(_with=admin, json={'name':commons.generate_random_hex()})
    assert res.ok
    store['org2'] = res.json()['organisation']

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_create_organisation(organisation_manager):
    res = Test.create.execute(_with=organisation_manager, json={'name':commons.generate_random_hex()})
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_create_organisation(public):
    res = Test.create.execute(_with=public, json={'name':commons.generate_random_hex()})
    assert res.ok



# Get all
def test_superuser_get_all(superuser):
    res = Test.base.x(_with=superuser)
    assert res.ok

def test_admin_get_all(admin):
    res = Test.base.x(_with=admin)
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_get_all(organisation_manager):
    res = Test.base.x(_with=organisation_manager)
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_get_all(public):
    res = Test.base.x(_with=public)
    assert res.ok


# Get one - self
def test_superuser_get_one_self(superuser):
    res = Test.info.execute(_with=superuser, _path_formats=superuser.info['organisationManaged']['UUID'])
    assert res.ok

def test_admin_get_one_self(admin):
    res = Test.info.execute(_with=admin, _path_formats=admin.info['organisationManaged']['UUID'])
    assert res.ok

def test_organisation_manager_get_one_self(organisation_manager):
    res = Test.info.execute(_with=organisation_manager, _path_formats=organisation_manager.info['organisationManaged']['UUID'])
    assert res.ok


# Get one - other
def test_superuser_get_one_other(superuser, admin):
    res = Test.info.execute(_with=superuser, _path_formats=admin.info['organisationManaged']['UUID'])
    assert res.ok

def test_admin_get_one_other(admin, organisation_manager):
    res = Test.info.execute(_with=admin, _path_formats=organisation_manager.info['organisationManaged']['UUID'])
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_organisation_manager_get_one_other(organisation_manager, superuser):
    res = Test.info.execute(_with=organisation_manager, _path_formats=superuser.info['organisationManaged']['UUID'])
    assert res.ok

@pytest.mark.xfail(reason="Admins only")
def test_public_get_one_other(public, superuser):
    res = Test.info.execute(_with=public, _path_formats=superuser.info['organisationManaged']['UUID'])
    assert res.ok


# Update - self
def test_superuser_update_self(superuser):
    jsonData = {'UUID': superuser.info['organisationManaged']['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=superuser, json=jsonData)
    assert res.ok

def test_admin_update_self(admin):
    jsonData = {'UUID': admin.info['organisationManaged']['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=admin, json=jsonData)
    assert res.ok

@pytest.mark.xfail(reason="Only admins can manage organisation")
def test_organisation_manager_update_self(organisation_manager):
    jsonData = {'UUID': organisation_manager.info['organisationManaged']['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=organisation_manager, json=jsonData)
    assert res.ok


# Update - other
def test_superuser_update_other(superuser, admin):
    jsonData = {'UUID': admin.info['organisationManaged']['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=superuser, json=jsonData)
    assert res.ok

def test_admin_update_other(admin, organisation_manager):
    jsonData = {'UUID': organisation_manager.info['organisationManaged']['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=admin, json=jsonData)
    assert res.ok

@pytest.mark.xfail(reason="Only admins can manage organisation")
def test_organisation_manager_update_other(organisation_manager, admin):
    jsonData = {'UUID': admin.info['organisationManaged']['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=organisation_manager, json=jsonData)
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_update_other(public, store):
    jsonData = {'UUID': store.get('org1')['UUID'],'newName':commons.generate_random_hex(prefix='upd-')}
    res = Test.update.x(_with=public, json=jsonData)
    assert res.ok


# Delete
def test_superuser_delete_organisation(superuser, store):
    jsonData = {'UUID': store.get('org1')['UUID']}
    res = Test.delete.x(_with=superuser, json=jsonData)
    assert res.ok

def test_admin_delete_organisation(admin):
    jsonData = {'UUID': admin.info['organisationManaged']['UUID']}
    res = Test.delete.x(_with=admin, json=jsonData)
    assert res.ok

@pytest.mark.xfail(reason="Only admins can manage organisation")
def test_organisation_manager_delete_organisation(organisation_manager):
    jsonData = {'UUID': organisation_manager.info['organisationManaged']['UUID']}
    res = Test.delete.x(_with=organisation_manager, json=jsonData)
    assert res.ok

@pytest.mark.xfail(reason="Unauthorized")
def test_public_delete_organisation(public, store):
    jsonData = {'UUID': store.get('org2')['UUID']}
    res = Test.delete.x(_with=public, json=jsonData)
    assert res.ok
