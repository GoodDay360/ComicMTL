# -*- coding: utf-8 -*-
"""
A Translation module.

You can translate text using this module.
"""
import random
import typing
import time
import json
import urllib
import py3langid as langid
from typing import List

import httpcore
import httpx
setattr(httpcore, 'SyncHTTPTransport', any)
from httpx import Timeout

from googletrans import urls, utils
from googletrans.gtoken import TokenAcquirer
from googletrans.constants import (
    DEFAULT_CLIENT_SERVICE_URLS,
    DEFAULT_FALLBACK_SERVICE_URLS,
    DEFAULT_USER_AGENT, LANGCODES, LANGUAGES, SPECIAL_CASES,
    DEFAULT_RAISE_EXCEPTION, DUMMY_DATA
)
from googletrans.models import Translated, Detected, TranslatedPart

from .common import CommonTranslator
from .keys import OPENAI_HTTP_PROXY

EXCLUDES = ('en', 'ca', 'fr')

RPC_ID = 'MkEWBc'

SYS_PROXY = urllib.request.getproxies()
SYS_HTTP_PROXY = None
if 'http' in SYS_PROXY:
    SYS_HTTP_PROXY = {}
    SYS_HTTP_PROXY['http'] = SYS_PROXY['http']
    SYS_HTTP_PROXY['https'] = SYS_PROXY['http']
elif OPENAI_HTTP_PROXY :
    SYS_HTTP_PROXY = {
        "http": "http://%s" % OPENAI_HTTP_PROXY,
        "https": "http://%s" % OPENAI_HTTP_PROXY
    }


class GoogleTranslator(CommonTranslator):
    """Google Translate ajax API implementation class

    You have to create an instance of Translator to use this API

    :param service_urls: google translate url list. URLs will be used randomly.
                         For example ``['translate.google.com', 'translate.google.co.kr']``
                         To preferably use the non webapp api, service url should be translate.googleapis.com
    :type service_urls: a sequence of strings

    :param user_agent: the User-Agent header to send when making requests.
    :type user_agent: :class:`str`

    :param proxies: proxies configuration.
                    Dictionary mapping protocol or protocol and host to the URL of the proxy
                    For example ``{'http': 'foo.bar:3128', 'http://host.name': 'foo.bar:4012'}``
    :type proxies: dictionary

    :param timeout: Definition of timeout for httpx library.
                    Will be used for every request.
    :type timeout: number or a double of numbers
    :param proxies: proxies configuration.
                    Dictionary mapping protocol or protocol and host to the URL of the proxy
                    For example ``{'http': 'foo.bar:3128', 'http://host.name': 'foo.bar:4012'}``
    :param raise_exception: if `True` then raise exception if smth will go wrong
    :param http2: whether to use HTTP2 (default: True)
    :param use_fallback: use a fallback method
    :type raise_exception: boolean
    """

    _LANGUAGE_CODE_MAP = {
        'CHS': 'zh-CN',
        'CHT': 'zh-TW',
        'JPN': 'ja',
        'ENG': 'en',
        'KOR': 'ko',
        'VIN': 'vi',
        'CSY': 'cs',
        'NLD': 'nl',
        'FRA': 'fr',
        'DEU': 'de',
        'HUN': 'hu',
        'ITA': 'it',
        'PLK': 'pl',
        'PTB': 'pt',
        'ROM': 'ro',
        'RUS': 'ru',
        'ESP': 'es',
        'TRK': 'tr',
        'UKR': 'uk',
        'ARA': 'ar',
        'SRP': 'sr',
        'HRV': 'hr',
        'THA': 'th',
        'IND': 'id',
        'FIL': 'tl'
    }


    def __init__(self, service_urls=DEFAULT_CLIENT_SERVICE_URLS, user_agent=DEFAULT_USER_AGENT,
                 raise_exception=DEFAULT_RAISE_EXCEPTION,
                 timeout: Timeout = None,
                 http2=True,
                 use_fallback=False):

        super().__init__()

        self.client = httpx.AsyncClient(http2=http2, proxies=SYS_HTTP_PROXY)
        # if proxies is not None:  # pragma: nocover

        self.client.headers.update({
            'User-Agent': user_agent,
            'Referer': 'https://translate.google.com',
        })

        if timeout is not None:
            self.client.timeout = timeout

        if use_fallback:
            self.service_urls = DEFAULT_FALLBACK_SERVICE_URLS
            self.client_type = 'gtx'
            pass
        else:
            #default way of working: use the defined values from user app
            self.service_urls = service_urls
            self.client_type = 'tw-ob'
            self.token_acquirer = TokenAcquirer(
                client=self.client, host=self.service_urls[0])

        self.raise_exception = raise_exception

    async def _translate(self, from_lang: str, to_lang: str, queries: List[str]) -> List[str]:

        # Separate en/ja queries to improve translation quality
        langs = ['en', 'ja']
        langid.set_languages(langs)
        lang_to_queries = {l: [] for l in langs}
        result = []
        for i, query in enumerate(queries):
            detected_lang = langid.classify(query)[0]
            lang_to_queries[detected_lang].append(query)
            result.append(detected_lang)
        langid.set_languages(None)

        lang_to_translation = {}
        for lang, lang_queries in lang_to_queries.items():
            if lang_queries:
                translation = await self._translate_query(from_lang, to_lang, '\n'.join(lang_queries))
                lang_to_translation[lang] = [] if not translation else translation.text.split('\n')

        for i, lang in enumerate(result):
            if len(lang_to_translation[lang]) > 0:
                result[i] = lang_to_translation[lang].pop(0)
            else: # Server has translated incorrectly
                result[i] = ''

        return [text.strip() for text in result]

    async def _translate_query(self, from_lang: str, to_lang: str, query: str) -> Translated:
        if not query:
            return None

        to_lang = to_lang.lower().split('_', 1)[0]
        from_lang = from_lang.lower().split('_', 1)[0]

        if from_lang != 'auto' and from_lang not in LANGUAGES:
            if from_lang in SPECIAL_CASES:
                from_lang = SPECIAL_CASES[from_lang]
            elif from_lang in LANGCODES:
                from_lang = LANGCODES[from_lang]
            else:
                raise ValueError('invalid source language')

        if to_lang not in LANGUAGES:
            if to_lang in SPECIAL_CASES:
                to_lang = SPECIAL_CASES[to_lang]
            elif to_lang in LANGCODES:
                to_lang = LANGCODES[to_lang]
            else:
                raise ValueError('invalid destination language')

        encountered_exception = None
        for _ in range(3):
            try:
                return await self._request_and_parse_translation(query, to_lang, from_lang)

            except Exception as e:
                encountered_exception = e
                time.sleep(1)

        raise encountered_exception

    async def _request_and_parse_translation(self, query, to_lang, from_lang):
        origin = query
        data, response = await self._request_translation(query, to_lang, from_lang)

        token_found = False
        square_bracket_counts = [0, 0]
        resp = ''
        for line in data.split('\n'):
            token_found = token_found or f'"{RPC_ID}"' in line[:30]
            if not token_found:
                continue

            is_in_string = False
            for index, char in enumerate(line):
                if char == '\"' and line[max(0, index - 1)] != '\\':
                    is_in_string = not is_in_string
                if not is_in_string:
                    if char == '[':
                        square_bracket_counts[0] += 1
                    elif char == ']':
                        square_bracket_counts[1] += 1

            resp += line
            if square_bracket_counts[0] == square_bracket_counts[1]:
                break

        data = json.loads(resp)
        if not data[0][2]:
            return None
        parsed = json.loads(data[0][2])
        # not sure
        # should_spacing = parsed[1][0][0][3]
        should_spacing = True
        translated_parts = []
        # print(parsed)
        try:
            for part in parsed[1][0][0][5]:
                try:
                    translated_parts.append(part[4][1][0])
                except (IndexError, TypeError):
                    translated_parts.append(part[0])
        except IndexError:
            translated_parts.append("")
        translated = (' ' if should_spacing else '').join(translated_parts)

        if from_lang == 'auto':
            try:
                from_lang = parsed[2]
            except Exception:
                pass
        if from_lang == 'auto':
            try:
                from_lang = parsed[0][2]
            except Exception:
                pass

        # currently not available
        confidence = None

        origin_pronunciation = None
        try:
            origin_pronunciation = parsed[0][0]
        except Exception:
            pass

        pronunciation = None
        try:
            pronunciation = parsed[1][0][0][1]
        except Exception:
            pass

        extra_data = {
            'confidence': confidence,
            'parts': translated_parts,
            'origin_pronunciation': origin_pronunciation,
            'parsed': parsed,
        }
        result = Translated(src=from_lang, dest=to_lang, origin=origin,
                            text=translated, pronunciation=pronunciation,
                            parts=translated_parts,
                            extra_data=extra_data,
                            response=response)
        return result

    def _build_rpc_request(self, text: str, dest: str, src: str):
        return json.dumps([[
            [
                RPC_ID,
                json.dumps([[text, src, dest, True], [None]], separators=(',', ':')),
                None,
                'generic',
            ],
        ]], separators=(',', ':'))

    def _pick_service_url(self):
        if len(self.service_urls) == 1:
            return self.service_urls[0]
        return random.choice(self.service_urls)

    async def _request_translation(self, text: str, dest: str, src: str):
        url = urls.TRANSLATE_RPC.format(host=self._pick_service_url())
        data = {
            'f.req': self._build_rpc_request(text, dest, src),
        }
        params = {
            'rpcids': RPC_ID,
            'bl': 'boq_translate-webserver_20201207.13_p0',
            'soc-app': 1,
            'soc-platform': 1,
            'soc-device': 1,
            'rt': 'c',
        }
 
        r = await self.client.post(url, params=params, data=data)

        if r.status_code != 200 and self.raise_exception:
            raise Exception('Unexpected status code "{}" from {}'.format(
                r.status_code, self.service_urls))

        return r.text, r

    async def _translate_legacy(self, text, dest, src, override):
        token = '' #dummy default value here as it is not used by api client
        if self.client_type == 'webapp':
            token = self.token_acquirer.do(text)

        params = utils.build_params(client=self.client_type, query=text, src=src, dest=dest,
                                    token=token, override=override)

        url = urls.TRANSLATE.format(host=self._pick_service_url())
        r = await self.client.get(url, params=params)

        if r.status_code == 200:
            data = utils.format_json(r.text)
            return data, r

        if self.raise_exception:
            raise Exception('Unexpected status code "{}" from {}'.format(
                r.status_code, self.service_urls))

        DUMMY_DATA[0][0][0] = text
        return DUMMY_DATA, r

    def _parse_extra_data(self, data):
        response_parts_name_mapping = {
            0: 'translation',
            1: 'all-translations',
            2: 'original-language',
            5: 'possible-translations',
            6: 'confidence',
            7: 'possible-mistakes',
            8: 'language',
            11: 'synonyms',
            12: 'definitions',
            13: 'examples',
            14: 'see-also',
        }

        extra = {}

        for index, category in response_parts_name_mapping.items():
            extra[category] = data[index] if (
                index < len(data) and data[index]) else None

        return extra

    async def translate_legacy(self, text, dest='en', src='auto', **kwargs):
        """Translate text from source language to destination language

        :param text: The source text(s) to be translated. Batch translation is supported via sequence input.
        :type text: UTF-8 :class:`str`; :class:`unicode`; string sequence (list, tuple, iterator, generator)

        :param dest: The language to translate the source text into.
                     The value should be one of the language codes listed in :const:`googletrans.LANGUAGES`
                     or one of the language names listed in :const:`googletrans.LANGCODES`.
        :param dest: :class:`str`; :class:`unicode`

        :param src: The language of the source text.
                    The value should be one of the language codes listed in :const:`googletrans.LANGUAGES`
                    or one of the language names listed in :const:`googletrans.LANGCODES`.
                    If a language is not specified,
                    the system will attempt to identify the source language automatically.
        :param src: :class:`str`; :class:`unicode`

        :rtype: Translated
        :rtype: :class:`list` (when a list is passed)

        Basic usage:
            >>> from googletrans import Translator
            >>> translator = Translator()
            >>> translator.translate('안녕하세요.')
            <Translated src=ko dest=en text=Good evening. pronunciation=Good evening.>
            >>> translator.translate('안녕하세요.', dest='ja')
            <Translated src=ko dest=ja text=こんにちは。 pronunciation=Kon'nichiwa.>
            >>> translator.translate('veritas lux mea', src='la')
            <Translated src=la dest=en text=The truth is my light pronunciation=The truth is my light>

        Advanced usage:
            >>> translations = translator.translate(['The quick brown fox', 'jumps over', 'the lazy dog'], dest='ko')
            >>> for translation in translations:
            ...    print(translation.origin, ' -> ', translation.text)
            The quick brown fox  ->  빠른 갈색 여우
            jumps over  ->  이상 점프
            the lazy dog  ->  게으른 개
        """
        dest = dest.lower().split('_', 1)[0]
        src = src.lower().split('_', 1)[0]

        if src != 'auto' and src not in LANGUAGES:
            if src in SPECIAL_CASES:
                src = SPECIAL_CASES[src]
            elif src in LANGCODES:
                src = LANGCODES[src]
            else:
                raise ValueError('invalid source language')

        if dest not in LANGUAGES:
            if dest in SPECIAL_CASES:
                dest = SPECIAL_CASES[dest]
            elif dest in LANGCODES:
                dest = LANGCODES[dest]
            else:
                raise ValueError('invalid destination language')

        if isinstance(text, list):
            result = []
            for item in text:
                translated = self.translate_legacy(item, dest=dest, src=src, **kwargs)
                result.append(translated)
            return result

        origin = text
        data, response = self.translate_legacy(text, dest, src)

        # this code will be updated when the format is changed.
        translated = ''.join([d[0] if d[0] else '' for d in data[0]])

        extra_data = self._parse_extra_data(data)

        # actual source language that will be recognized by Google Translator when the
        # src passed is equal to auto.
        try:
            src = data[2]
        except Exception:  # pragma: nocover
            pass

        pron = origin
        try:
            pron = data[0][1][-2]
        except Exception:  # pragma: nocover
            pass

        if pron is None:
            try:
                pron = data[0][1][2]
            except Exception:  # pragma: nocover
                pass

        if dest in EXCLUDES and pron == origin:
            pron = translated

        # put final values into a new Translated object
        result = Translated(src=src, dest=dest, origin=origin,
                            text=translated, pronunciation=pron,
                            extra_data=extra_data,
                            response=response)

        return result

    async def detect(self, text: str):
        translated = await self._translate_query('auto', 'en', text)
        result = Detected(lang=translated.src, confidence=translated.extra_data.get('confidence', None), response=translated._response)
        return result

    async def detect_legacy(self, text, **kwargs):
        """Detect language of the input text

        :param text: The source text(s) whose language you want to identify.
                     Batch detection is supported via sequence input.
        :type text: UTF-8 :class:`str`; :class:`unicode`; string sequence (list, tuple, iterator, generator)

        :rtype: Detected
        :rtype: :class:`list` (when a list is passed)

        Basic usage:
            >>> from googletrans import Translator
            >>> translator = Translator()
            >>> translator.detect('이 문장은 한글로 쓰여졌습니다.')
            <Detected lang=ko confidence=0.27041003>
            >>> translator.detect('この文章は日本語で書かれました。')
            <Detected lang=ja confidence=0.64889508>
            >>> translator.detect('This sentence is written in English.')
            <Detected lang=en confidence=0.22348526>
            >>> translator.detect('Tiu frazo estas skribita en Esperanto.')
            <Detected lang=eo confidence=0.10538048>

        Advanced usage:
            >>> langs = translator.detect(['한국어', '日本語', 'English', 'le français'])
            >>> for lang in langs:
            ...    print(lang.lang, lang.confidence)
            ko 1
            ja 0.92929292
            en 0.96954316
            fr 0.043500196
        """
        if isinstance(text, list):
            result = []
            for item in text:
                lang = await self.detect(item)
                result.append(lang)
            return result

        data, response = await self._translate_legacy(text, 'en', 'auto', kwargs)

        # actual source language that will be recognized by Google Translator when the
        # src passed is equal to auto.
        src = ''
        confidence = 0.0
        try:
            if len(data[8][0]) > 1:
                src = data[8][0]
                confidence = data[8][-2]
            else:
                src = ''.join(data[8][0])
                confidence = data[8][-2][0]
        except Exception:  # pragma: nocover
            pass
        result = Detected(lang=src, confidence=confidence, response=response)

        return result
