from django import forms
from .models import Stock, Casing, Production
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit


class InventoryForm(forms.ModelForm):
    class Meta:
        model = Stock
        fields = ['item_name', 'stock_in', 'stock_in_date', 'stock_out', 'units']
        widgets = {'stock_in_date': forms.DateInput(attrs={'type': 'date'})}

class NewStockForm(forms.ModelForm):
    class Meta:
        model = Stock
        fields = ['stock_in', 'stock_in_date']
        widgets = {'stock_in_date': forms.DateInput(attrs={'type': 'date'})}

class DispenseForm(forms.ModelForm):
    class Meta:
        model = Stock
        fields = ['stock_out']


class EditForm(forms.ModelForm):
    class Meta:
        model = Stock
        #editted here
        fields = ['stock_in', 'stock_in_date', 'stock_out']
        widgets = {'stock_in_date': forms.DateInput(attrs={'type': 'date'})}


class CasingForm(forms.ModelForm):
    class Meta:
        model = Casing
        fields = ['batch_number', 'device_name', 'quantity', 'date_start', 'detail']
        widgets = {'date_start': forms.DateInput(attrs={'type': 'date'})}

class TheForm(forms.ModelForm):
    class Meta:
        model = Production
        fields = ['batch_number','phase', 'quantity_in', 'quantity_out','detail']
        labels = {'quantity_in': 'Target'}

class THTForm(forms.ModelForm):
    class Meta:
        model = Production
        fields = ['batch_number','phase', 'quantity_in', 'quantity_out','detail']


class MyForm(forms.Form):
    choice = forms.ChoiceField(choices=[('0', 'Select a phase'),
                                        ('1', 'Casing'), 
                                        ('2', 'SMT'), 
                                        ('3', 'THT'), 
                                        ('4', 'Tunning'), 
                                        ('5', 'Monitor Assembly'), 
                                        ('6', 'Communication Config'), 
                                        ('7', 'Analysis'), 
                                        ('8', 'Correction')
                                        ],
                               label = 'Phases')

    def __init__(self, *args, **kwargs):
        super(MyForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            'choice'
        )


#end edits