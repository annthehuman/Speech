from django import forms
from .models import Post
 
class PostForm(forms.ModelForm):
 
    class Meta:
        model = Post
        fields = ('title', 'files',)
        #audio = forms.FileField(label = "")
'''
class AudioForm(forms.Form):
    audio = forms.FileField(label = "")
'''