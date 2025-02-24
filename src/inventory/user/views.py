from django.shortcuts import render,redirect
from django.contrib.auth.forms import UserCreationForm
from .forms import Persons
from django.contrib.auth.decorators import login_required
from django.contrib import messages

from django.contrib.auth import login, logout, authenticate, get_user_model
from .tokens import account_activation_token
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage


# Create your views here.
def logout_view(request):
    logout(request)
    # Redirect to the desired page after logging out
    return redirect('login')



def activate(request, uidb64, token):
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except:
        user = None

    if user is not None and account_activation_token.check_token(user,token):
        user.is_active = True
        user.save()
        return redirect('login')
    

    return redirect('register')


def activateEmail(request, user, to_email):
    mail_subject = "Activate AirQo Account"
    message = render_to_string("user/confirmation_email.html", {
        'user' : user.username,
        'domain' : get_current_site(request).domain,
        'uid' : urlsafe_base64_encode(force_bytes(user.pk)),
        'token' : account_activation_token.make_token(user),
        'protocol' : 'https' if request.is_secure() else 'http'
    })
    email = EmailMessage(mail_subject,message,to=[to_email])
    if email.send():
        messages.success(request,f'Dear <b>{user}</b>, <br> Please verify <b>{to_email}</b> is your email by clicking the link ..')

    else:
        messages.error(request,f'Problem sending email to {email}, recheck email.')
    
    


def register(request):
    if request.method == 'POST':
        form = Persons(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            activateEmail(request,user, 'gibsonoluka7@gmail.com')
            return redirect('login')
    else:
        form = Persons()
    context = {
        'form': form
    }
    return render(request,'user/register.html',context)

@login_required
def profile(request):
    return render(request,'user/profile.html')