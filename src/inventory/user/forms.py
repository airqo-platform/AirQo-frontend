from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Profile


PERMISSIONS = (
    ('view','view'),
    ('edit','edit'),
    ('admin','admin')
)

class Persons(UserCreationForm):
    #full_name = forms.CharField(max_length=100)
    phone_number = forms.CharField()
    email = forms.EmailField()
    #login_date = forms.DateField()
    #permission_level = forms.ChoiceField(choices=PERMISSIONS)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = UserCreationForm.Meta.fields + ('phone_number', 'email')

    # def save(self, commit=True):
    #     user = super().save(commit=commit)
    #     phone_number = self.cleaned_data['phone_number']
    #     email = self.cleaned_data['email']
    #     Profile.objects.create(user=user, phone_number=phone_number, email=email)
    #     return user