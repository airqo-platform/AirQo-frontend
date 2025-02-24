from invoke import run, task


@task(name='prettier-js')
def prettier_js(context):
    """Runs prettier, a JS code formatter"""
    run('bin/prettier_fix.sh', echo=True)


@task(name='prettier-py')
def prettier_py(context):
    run('autopep8 --in-place --recursive .', echo=True)


@task(name='run-build')
def build_prod(context):
    """run webpack build"""
    run('npm run build', echo=True)


@task(name='webpack-server')
def webpack_dev_server(context):
    """run webpack-dev server"""
    run('npm run serve', echo=True)


@task(name='run-web')
def python_server(context):
    """run python server"""
    run('python manage.py migrate', echo=True)
    run('python manage.py runserver', echo=True)
