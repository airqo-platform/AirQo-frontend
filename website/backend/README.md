# The AirQo Website Server.
### Prerequisites

- [Python v3.8+](https://www.python.org/downloads/)
- [Pip](https://pip.pypa.io/en/stable/installation/)
- Installation of packages from *requirements.txt*

Details on the installation and running the server can be found in the overall [README](https://github.com/airqo-platform/AirQo-frontend/blob/staging/website/README.md) file.

## Understanding the Data Models
Each data model has been created with design in mind and follows the requirements of the content managers.

It is important to note that the data models cater for website content that changes frequently (<6 months) otherwise the content is rendered static and is changed through code.

Data models are the engine within this server and each serves a different purpose. They are contained in the backend folder and named according to their purpose. After which they are configured in settings.py.

````
|_ Website
    |_ Backend
        |- Data model files
        |- settings.py
    |_Frontend
        |_ src
            |- User facing files
````
### Contents of the Data Model Folders
Each folder contains these files:
````
|_ Data model folder
    |_ migrations
    |- __init__.py
    |- apps.py
    |- admin.py
    |- models.py
    |- serializers.py
    |- tests.py
    |- views.py
````

#### *models.py*

In this file is where the model classes are written. These classes describe the attributes of each model i.e title, name, link, description etc.

If multiple classes are required to create the full model, then relationships between the classes are described within this very file. (1:1, 1:M, M:M)

After declaring all attributes, run migrations using the commands in your virtual environment:

1.Make migrations to see that the desired changes.

    python manage.py makemigrations

2.Run migrations to realise the changes

    python manage.py migrate

#### *The Migrations Folder*
This folder contains the migration and alteration files which create a flow of the transition of the data models. CAUTION should always be taken with these files and they shouldn't be deleted or manually edited without sufficient of Django migrations and database management. 

The files are used as version control of the changes the models file has gone through.

    Note: Required attributes added to the data models.py file after data entries already exist, should have a default value to populate correct tables. Otherwise it creates conflicts

#### *apps.py*
In this file, you define the name of your data model folder which are called *applications* in Django. 

The name described in this file is how the app is configured in *settings.py*.
An app not configured in settings.py is not recognised
    
    INSTALLED_APPS=[
        backend.{{data_model}}.apps.{{class_name}}
    ]

#### *admin.py*
This is the representation of the data models on the admin interface. 

It reads metadata from your models through which the content is added. It allows the actions of CREATE, READ, UPDATE and DELETE of entries.

Changes are reflected in the database as well.

To configure the tables as desired, visit the django [documentation](https://docs.djangoproject.com/en/4.2/ref/contrib/admin/)

#### *tests.py*
Written tests are added to this file to keep the code clean and strict. Changes made to models should reflect in the tests as well to avoid test errors.

#### *serializers.py*
The classes in this file serialize/transform the data entries from python to JSON since the frontend is written in JavaScript. 

This makes it easier for the frontend app to understand the data received from the server and manipulate it accordingly.

#### *views.py*
Here permissions are defined for the API and consumers of the data model's endpoint.

The data required is returned and permission_classes defined

## The API
The data models are accessed by frontend applications using the API which is defined in:

    |_ Backend
        |- urls.py

Each model's endpoint is registered in the API router and accessed using it's ViewSet defined in *views.py*

Django automatically creates an API served through *localhost:8000/api/*.

The schema of the API is also configured in *urls.py*. Further information is available in the Django docs.

## Important links

    Server=> localhost:8000/
    Admin Interface=> localhost:8000/admin/
    Server API=> localhost:8000/api/

To run the server, refer to the overall README.