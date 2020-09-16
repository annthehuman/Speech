from django.shortcuts import render, get_object_or_404, redirect
from django.utils import timezone
from .models import Post
from .forms import PostForm
#from django.views.generic import ListView, CreateView 
#from django.urls import reverse_lazy 
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
#from django.core.files.storage import FileSystemStorage
from qsstats import QuerySetStats
import speech_recognition as sr
import warnings
warnings.simplefilter('ignore')
import matplotlib.pyplot as plt
import io 
import urllib, base64
import json
from os import path
from pydub import AudioSegment
from pyparsing import Word, OneOrMore, alphanums, ZeroOrMore
import re
from collections import Counter


def post_list(request):
	posts = Post.objects.filter(published_date__lte=timezone.now()).order_by('-published_date')
	return render(request, 'recognitionpost/post_list.html', {'posts': posts})

def post_detail(request, pk):
    post = get_object_or_404(Post, pk=pk)
    return render(request, 'recognitionpost/post_detail.html', {'post': post})

def name_parsing(src):
    rus_alphas = 'йцукенгшщзхъфывапролджэячсмитьбюЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ-_'
    audio_unit = Word(alphanums+rus_alphas)
    audio_name = audio_unit + OneOrMore("." + audio_unit)
    audio_name_parsing = audio_name.parseString(src)
    audio_format = audio_name_parsing[-1]
    print('Парсинг', audio_name_parsing)
    name = ''
    for i in audio_name_parsing[:-2]:
        name += i
    return(audio_format, name)

def format(src, audio_format, name):
    sound = AudioSegment.from_file("/home/anna/speech/files/audio/"+ src, audio_format)
    sound.export("/home/anna/speech/files/audio/"+ name +".wav", format="wav")

def count_badparasites(text):
    with open("bad.txt", 'r') as bad_words_txt:
        bad_words = []
        bad_words_dict = {}
        i = 0
        for line in bad_words_txt:
            for word in re.sub(r'[ \n|\ufeff]', '', line).split(','):
                bad_words.append(word)
                bad_words_dict[word] = i
                i += 1

    with open("parasit.txt", 'r') as parasite_words_txt:
        parasite_two_words = []
        parasite_one_word = []
        parasite_one_word_dict = {}
        i = 0
        for line in parasite_words_txt:
            line = re.sub(r'[\n]', '', line)
            if len(parasite_two_words) < 27:
                parasite_two_words.append(line)
            else:
                parasite_one_word.append(line)
                parasite_one_word_dict[line] = i
                i += 1

    bad_words_counter = 0
    parasites_in_text = []
    for words_in_text in text.split(' '):
        if parasite_one_word_dict.get(words_in_text):
            parasites_in_text.append(parasite_one_word[parasite_one_word_dict.get(words_in_text)])  
        elif bad_words_dict.get(words_in_text) or '*' in words_in_text:
            bad_words_counter += 1

    for parasite_two_word in parasite_two_words:
        if parasite_two_word in text:
            parasites_in_text.append(parasite_two_word)

    count_parasites = dict(Counter(parasites_in_text))
    return(bad_words_counter, count_parasites)

def post_new(request):
    if request.method == 'POST':
        form = PostForm(request.POST, request.FILES)
        if form.is_valid():
            newpost = form.save(commit=False)
            #post.author = request.user
            newpost.published_date = timezone.now()
            newpost.save()

            #парсим название аудио и конвертируем в wav
            audio = str(request.FILES['files'])
            if ' ' in audio:
                audio = re.sub(r'[ ]', '_', audio)
            if '"' in audio:
                audio = re.sub(r'["]', '22', audio)
            signs = '~`!@#$%^&*()+=<>,\'№'
            for sign in signs:
                if sign in audio:
                    audio = re.sub(r'[~`!@#$%^&*()+=<>,\'№]', '', audio)
            print(audio)
            audio_format, name = name_parsing(audio)
            if audio_format != "wav":
                format(audio, audio_format, name)
            print(audio)


            AUDIO_FILE_PATH = "/home/anna/speech/files/audio/"+name+".wav"

            #new_audio = Post.objects.create(audio = request.FILES['audio'])
            # создаем экземпляр распознавателя и загружаем файл
            r = sr.Recognizer()
            with sr.AudioFile(AUDIO_FILE_PATH) as source:
                audio = r.record(source)  
            # распознаем при помощи google. 
            text = r.recognize_google(audio, language = 'ru').lower()

            bad_words, counted_parasites = count_badparasites(text)
            '''
            #считаем количество слов-паразитов 
            c_tipo= text.count('типа')
            c_vprincipe= text.count('в принципе')
            c_nu= text.count('ну')
            c_kakbi= text.count('как бы')
            c_koroche= text.count('короче')
            c = [c_tipo, c_vprincipe, c_nu, c_kakbi, c_koroche]
            c_name = ["типa", "в принципе", "ну", "как бы", "короче"]
            
            tipa = 'типа: '+str(c_tipo)
            vprincipe = 'в принципе: ' + str(c_vprincipe)
            nu = 'ну: ' + str(c_nu)
            kakbi = 'как бы: ' + str(c_kakbi)
            koroche = 'короче: ' + str(c_koroche)
            '''
            return render(request, 'recognitionpost/post_detail.html', {'text': text, 'bad_words' : bad_words, 'parasites' : counted_parasites, 'post':newpost})
    else:
        form = PostForm()
        return render(request, 'recognitionpost/post_edit.html', {'form': form})