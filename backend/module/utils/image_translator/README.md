# Image/Manga Translator

![Commit activity](https://img.shields.io/github/commit-activity/m/zyddnys/manga-image-translator)
![Lines of code](https://img.shields.io/tokei/lines/github/zyddnys/manga-image-translator?label=lines%20of%20code)
![License](https://img.shields.io/github/license/zyddnys/manga-image-translator)
![Contributors](https://img.shields.io/github/contributors/zyddnys/manga-image-translator)
[![Discord](https://img.shields.io/discord/739305951085199490?logo=discord&label=discord&logoColor=white)](https://discord.gg/Ak8APNy4vb)


> Translate texts in manga/images.\
> [中文说明](README_CN.md) | [Change Log](CHANGELOG.md) \
> Join us on discord <https://discord.gg/Ak8APNy4vb>

Some manga/images will never be translated, therefore this project is born.

- [Image/Manga Translator](#imagemanga-translator)
  - [Samples](#samples)
  - [Online Demo](#online-demo)
  - [Disclaimer](#disclaimer)
  - [Installation](#installation)
    - [Pip/venv](#pipvenv)
    - [Poetry](#poetry)
      - [Additional instructions for **Windows**](#additional-instructions-for-windows)
    - [Docker](#docker)
      - [Hosting the web server](#hosting-the-web-server)
      - [Using as CLI](#using-as-cli)
      - [Setting Translation Secrets](#setting-translation-secrets)
      - [Using with Nvidia GPU](#using-with-nvidia-gpu)
      - [Building locally](#building-locally)
  - [Usage](#usage)
    - [Batch mode (default)](#batch-mode-default)
    - [Demo mode](#demo-mode)
    - [Web Mode](#web-mode)
    - [Api Mode](#api-mode)
  - [Related Projects](#related-projects)
  - [Docs](#docs)
    - [Recommended Modules](#recommended-modules)
      - [Tips to improve translation quality](#tips-to-improve-translation-quality)
    - [Options](#options)
    - [Language Code Reference](#language-code-reference)
    - [Translators Reference](#translators-reference)
    - [GPT Config Reference](#gpt-config-reference)
    - [Using Gimp for rendering](#using-gimp-for-rendering)
    - [Api Documentation](#api-documentation)
      - [Synchronous mode](#synchronous-mode)
      - [Asynchronous mode](#asynchronous-mode)
      - [Manual translation](#manual-translation)
  - [Next steps](#next-steps)
  - [Support Us](#support-us)
    - [Thanks To All Our Contributors :](#thanks-to-all-our-contributors-)

## Samples

Please note that the samples may not always be updated, they may not represent the current main branch version.

<table>
  <thead>
    <tr>
      <th align="center" width="50%">Original</th>
      <th align="center" width="50%">Translated</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232265329-6a560438-e887-4f7f-b6a1-a61b8648f781.png">
          <img alt="佐藤さんは知っていた - 猫麦" src="https://user-images.githubusercontent.com/31543482/232265329-6a560438-e887-4f7f-b6a1-a61b8648f781.png" />
        </a>
        <br />
        <a href="https://twitter.com/09ra_19ra/status/1647079591109103617/photo/1">(Source @09ra_19ra)</a>
      </td>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232265339-514c843a-0541-4a24-b3bc-1efa6915f757.png">
          <img alt="Output" src="https://user-images.githubusercontent.com/31543482/232265339-514c843a-0541-4a24-b3bc-1efa6915f757.png" />
        </a>
        <br />
        <a href="https://user-images.githubusercontent.com/31543482/232265376-01a4557d-8120-4b6b-b062-f271df177770.png">(Mask)</a>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232265479-a15c43b5-0f00-489c-9b04-5dfbcd48c432.png">
          <img alt="Gris finds out she's of royal blood - VERTI" src="https://user-images.githubusercontent.com/31543482/232265479-a15c43b5-0f00-489c-9b04-5dfbcd48c432.png" />
        </a>
        <br />
        <a href="https://twitter.com/VERTIGRIS_ART/status/1644365184142647300/photo/1">(Source @VERTIGRIS_ART)</a>
      </td>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232265480-f8ba7a28-846f-46e7-8041-3dcb1afe3f67.png">
          <img alt="Output" src="https://user-images.githubusercontent.com/31543482/232265480-f8ba7a28-846f-46e7-8041-3dcb1afe3f67.png" />
        </a>
        <br />
        <code>--detector ctd</code>
        <a href="https://user-images.githubusercontent.com/31543482/232265483-99ad20af-dca8-4b78-90f9-a6599eb0e70b.png">(Mask)</a>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232264684-5a7bcf8e-707b-4925-86b0-4212382f1680.png">
          <img alt="陰キャお嬢様の新学期🏫📔🌸 (#3) - ひづき夜宵🎀💜" src="https://user-images.githubusercontent.com/31543482/232264684-5a7bcf8e-707b-4925-86b0-4212382f1680.png" />
        </a>
        <br />
        <a href="https://twitter.com/hiduki_yayoi/status/1645186427712573440/photo/2">(Source @hiduki_yayoi)</a>
      </td>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232264644-39db36c8-a8d9-4009-823d-bf85ca0609bf.png">
          <img alt="Output" src="https://user-images.githubusercontent.com/31543482/232264644-39db36c8-a8d9-4009-823d-bf85ca0609bf.png" />
        </a>
        <br />
        <code>--translator none</code>
        <a href="https://user-images.githubusercontent.com/31543482/232264671-bc8dd9d0-8675-4c6d-8f86-0d5b7a342233.png">(Mask)</a>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232265794-5ea8a0cb-42fe-4438-80b7-3bf7eaf0ff2c.png">
          <img alt="幼なじみの高校デビューの癖がすごい (#1) - 神吉李花☪️🐧" src="https://user-images.githubusercontent.com/31543482/232265794-5ea8a0cb-42fe-4438-80b7-3bf7eaf0ff2c.png" />
        </a>
        <br />
        <a href="https://twitter.com/rikak/status/1642727617886556160/photo/1">(Source @rikak)</a>
      </td>
      <td align="center" width="50%">
        <a href="https://user-images.githubusercontent.com/31543482/232265795-4bc47589-fd97-4073-8cf4-82ae216a88bc.png">
          <img alt="Output" src="https://user-images.githubusercontent.com/31543482/232265795-4bc47589-fd97-4073-8cf4-82ae216a88bc.png" />
        </a>
        <br />
        <a href="https://user-images.githubusercontent.com/31543482/232265800-6bdc7973-41fe-4d7e-a554-98ea7ca7a137.png">(Mask)</a>
      </td>
    </tr>
  </tbody>
</table>

## Online Demo

Official Demo (by zyddnys): <https://touhou.ai/imgtrans/>\
Browser Userscript (by QiroNT): <https://greasyfork.org/scripts/437569>

- Note this may not work sometimes due to stupid google gcp kept restarting my instance.
  In that case you can wait for me to restart the service, which may take up to 24 hrs.
- Note this online demo is using the current main branch version.

## Disclaimer
Successor to [MMDOCR-HighPerformance](https://github.com/PatchyVideo/MMDOCR-HighPerformance).\
**This is a hobby project, you are welcome to contribute!**\
Currently this only a simple demo, many imperfections exist, we need your support to make this project better!\
Primarily designed for translating Japanese text, but also supports Chinese, English and Korean.\
Supports inpainting, text rendering and colorization.
## Installation

### Pip/venv

```bash
# First, you need to have Python(>=3.8) installed on your system
# The latest version often does not work with some pytorch libraries yet
$ python --version
Python 3.10.6

# Clone this repo
$ git clone https://github.com/zyddnys/manga-image-translator.git

# Create venv
$ python -m venv venv

# Activate venv
$ source venv/bin/activate

# For --use-gpu option go to https://pytorch.org/ and follow
# pytorch installation instructions. Add `--upgrade --force-reinstall`
# to the pip command to overwrite the currently installed pytorch version.

# Install the dependencies
$ pip install -r requirements.txt
```

### Poetry

```bash
git clone https://github.com/zyddnys/manga-image-translator.git
cd manga-image-translator
poetry shell
poetry install
```

The models will be downloaded into `./models` at runtime.

#### Additional instructions for **Windows**

Before you start the pip install, first install Microsoft C++ Build
Tools ([Download](https://visualstudio.microsoft.com/vs/),
[Instructions](https://stackoverflow.com/questions/40504552/how-to-install-visual-c-build-tools))
as some pip dependencies will not compile without it.
(See [#114](https://github.com/zyddnys/manga-image-translator/issues/114)).

To use [cuda](https://developer.nvidia.com/cuda-downloads?target_os=Windows&target_arch=x86_64)
on windows install the correct pytorch version as instructed on <https://pytorch.org/>.

Also, if you have trouble installing pydensecrf with the command above you can install the pre-compiled wheels
with `pip install https://www.lfd.uci.edu/~gohlke/pythonlibs/#_pydensecrf`.

### Docker

Requirements:

- Docker (version 19.03+ required for CUDA / GPU acceleration)
- Docker Compose (Optional if you want to use files in the `demo/doc` folder)
- Nvidia Container Runtime (Optional if you want to use CUDA)

This project has docker support under `zyddnys/manga-image-translator:main` image.
This docker image contains all required dependencies / models for the project.
It should be noted that this image is fairly large (~ 15GB).

#### Hosting the web server

The web server can be hosted using (For CPU)

```bash
docker run -p 5003:5003 -v result:/app/result --ipc=host --rm zyddnys/manga-image-translator:main -l ENG --manga2eng -v --mode web --host=0.0.0.0 --port=5003
```

or

```bash
docker-compose -f demo/doc/docker-compose-web-with-cpu.yml up
```

depending on which you prefer. The web server should start on port [5003](http://localhost:5003)
and images should become in the `/result` folder.

#### Using as CLI

To use docker with the CLI (I.e in batch mode)

```bash
docker run -v <targetFolder>:/app/<targetFolder> -v <targetFolder>-translated:/app/<targetFolder>-translated  --ipc=host --rm zyddnys/manga-image-translator:main --mode=batch -i=/app/<targetFolder> <cli flags>
```

**Note:** In the event you need to reference files on your host machine
you will need to mount the associated files as volumes into the `/app` folder inside the container.
Paths for the CLI will need to be the internal docker path `/app/...` instead of the paths on your host machine

#### Setting Translation Secrets

Some translation services require API keys to function to set these pass them as env vars into the docker container. For
example:

```bash
docker run --env="DEEPL_AUTH_KEY=xxx" --ipc=host --rm zyddnys/manga-image-translator:main <cli flags>
```

#### Using with Nvidia GPU

> To use with a supported GPU please first read the initial `Docker` section. There are some special dependencies you
> will need to use

To run the container with the following flags set:

```bash
docker run ... --gpus=all ... zyddnys/manga-image-translator:main ... --use-gpu
```

Or (For the web server + GPU)

```bash
docker-compose -f demo/doc/docker-compose-web-with-gpu.yml up
```

#### Building locally

To build the docker image locally you can run (You will require make on your machine)

```bash
make build-image
```

Then to test the built image run

```bash
make run-web-server
```

## Usage

### Batch mode (default)

```bash
# use `--use-gpu` for speedup if you have a compatible NVIDIA GPU.
# use `--target-lang <language_code>` to specify a target language.
# use `--inpainter=none` to disable inpainting.
# use `--translator=none` if you only want to use inpainting (blank bubbles)
# replace <path> with the path to the image folder or file.
$ python -m manga_translator -v --translator=google -l ENG -i <path>
# results can be found under `<path_to_image_folder>-translated`.
```

### Demo mode

```bash
# saves singular image into /result folder for demonstration purposes
# use `--mode demo` to enable demo translation.
# replace <path> with the path to the image file.
$ python -m manga_translator --mode demo -v --translator=google -l ENG -i <path>
# result can be found in `result/`.
```

### Web Mode

```bash
# use `--mode web` to start a web server.
$ python -m manga_translator -v --mode web --use-gpu
# the demo will be serving on http://127.0.0.1:5003
```

### Api Mode

```bash
# use `--mode web` to start a web server.
$ python -m manga_translator -v --mode api --use-gpu
# the demo will be serving on http://127.0.0.1:5003
```
## Related Projects
GUI implementation: [BallonsTranslator](https://github.com/dmMaze/BallonsTranslator)

## Docs

### Recommended Modules
Detector:
- ENG: ??
- JPN: ??
- CHS: ??
- KOR: ??
- Using `--detector ctd` can increase the amount of text lines detected


OCR:
- ENG: ??
- JPN: ??
- CHS: ??
- KOR: 48px

Translator:
- JPN -> ENG: **Sugoi**
- CHS -> ENG: ??
- CHS -> JPN: ??
- JPN -> CHS: ??
- ENG -> JPN: ??
- ENG -> CHS: ??

Inpainter: ??

Colorizer: **mc2**

<!-- Auto generated start (See devscripts/make_readme.py) -->

#### Tips to improve translation quality

- Small resolutions can sometimes trip up the detector, which is not so good at picking up irregular text sizes. To
  circumvent this you can use an upscaler by specifying `--upscale-ratio 2` or any other value
- If the text being rendered is too small to read specify `--font-size-minimum 30` for instance or use the `--manga2eng`
  renderer that will try to adapt to detected textbubbles
- Specify a font with `--font-path fonts/anime_ace_3.ttf` for example

### Options

```text
-h, --help                                   show this help message and exit
-m, --mode {demo,batch,web,web_client,ws,api}
                                             Run demo in single image demo mode (demo), batch
                                             translation mode (batch), web service mode (web)
-i, --input INPUT [INPUT ...]                Path to an image file if using demo mode, or path to an
                                             image folder if using batch mode
-o, --dest DEST                              Path to the destination folder for translated images in
                                             batch mode
-l, --target-lang {CHS,CHT,CSY,NLD,ENG,FRA,DEU,HUN,ITA,JPN,KOR,PLK,PTB,ROM,RUS,ESP,TRK,UKR,VIN,ARA,CNR,SRP,HRV,THA,IND,FIL}
                                             Destination language
-v, --verbose                                Print debug info and save intermediate images in result
                                             folder
-f, --format {png,webp,jpg,xcf,psd,pdf}      Output format of the translation.
--attempts ATTEMPTS                          Retry attempts on encountered error. -1 means infinite
                                             times.
--ignore-errors                              Skip image on encountered error.
--overwrite                                  Overwrite already translated images in batch mode.
--skip-no-text                               Skip image without text (Will not be saved).
--model-dir MODEL_DIR                        Model directory (by default ./models in project root)
--use-gpu                                   Turn on/off gpu
--use-gpu-limited                           Turn on/off gpu (excluding offline translator)
--detector {default,ctd,craft,none}          Text detector used for creating a text mask from an
                                             image, DO NOT use craft for manga, it's not designed
                                             for it
--ocr {32px,48px,48px_ctc,mocr}              Optical character recognition (OCR) model to use
--use-mocr-merge                             Use bbox merge when Manga OCR inference.
--inpainter {default,lama_large,lama_mpe,sd,none,original}
                                             Inpainting model to use
--upscaler {waifu2x,esrgan,4xultrasharp}     Upscaler to use. --upscale-ratio has to be set for it
                                             to take effect
--upscale-ratio UPSCALE_RATIO                Image upscale ratio applied before detection. Can
                                             improve text detection.
--colorizer {mc2}                            Colorization model to use.
--translator {google,youdao,baidu,deepl,papago,caiyun,gpt3,gpt3.5,gpt4,none,original,offline,nllb,nllb_big,sugoi,jparacrawl,jparacrawl_big,m2m100,m2m100_big,sakura}
                                             Language translator to use
--translator-chain TRANSLATOR_CHAIN          Output of one translator goes in another. Example:
                                             --translator-chain "google:JPN;sugoi:ENG".
--selective-translation SELECTIVE_TRANSLATION
                                             Select a translator based on detected language in
                                             image. Note the first translation service acts as
                                             default if the language isn't defined. Example:
                                             --translator-chain "google:JPN;sugoi:ENG".
--revert-upscaling                           Downscales the previously upscaled image after
                                             translation back to original size (Use with --upscale-
                                             ratio).
--detection-size DETECTION_SIZE              Size of image used for detection
--det-rotate                                 Rotate the image for detection. Might improve
                                             detection.
--det-auto-rotate                            Rotate the image for detection to prefer vertical
                                             textlines. Might improve detection.
--det-invert                                 Invert the image colors for detection. Might improve
                                             detection.
--det-gamma-correct                          Applies gamma correction for detection. Might improve
                                             detection.
--unclip-ratio UNCLIP_RATIO                  How much to extend text skeleton to form bounding box
--box-threshold BOX_THRESHOLD                Threshold for bbox generation
--text-threshold TEXT_THRESHOLD              Threshold for text detection
--min-text-length MIN_TEXT_LENGTH            Minimum text length of a text region
--no-text-lang-skip                          Dont skip text that is seemingly already in the target
                                             language.
--inpainting-size INPAINTING_SIZE            Size of image used for inpainting (too large will
                                             result in OOM)
--inpainting-precision {fp32,fp16,bf16}      Inpainting precision for lama, use bf16 while you can.
--colorization-size COLORIZATION_SIZE        Size of image used for colorization. Set to -1 to use
                                             full image size
--denoise-sigma DENOISE_SIGMA                Used by colorizer and affects color strength, range
                                             from 0 to 255 (default 30). -1 turns it off.
--mask-dilation-offset MASK_DILATION_OFFSET  By how much to extend the text mask to remove left-over
                                             text pixels of the original image.
--font-size FONT_SIZE                        Use fixed font size for rendering
--font-size-offset FONT_SIZE_OFFSET          Offset font size by a given amount, positive number
                                             increase font size and vice versa
--font-size-minimum FONT_SIZE_MINIMUM        Minimum output font size. Default is
                                             image_sides_sum/200
--font-color FONT_COLOR                      Overwrite the text fg/bg color detected by the OCR
                                             model. Use hex string without the "#" such as FFFFFF
                                             for a white foreground or FFFFFF:000000 to also have a
                                             black background around the text.
--line-spacing LINE_SPACING                  Line spacing is font_size * this value. Default is 0.01
                                             for horizontal text and 0.2 for vertical.
--force-horizontal                           Force text to be rendered horizontally
--force-vertical                             Force text to be rendered vertically
--align-left                                 Align rendered text left
--align-center                               Align rendered text centered
--align-right                                Align rendered text right
--uppercase                                  Change text to uppercase
--lowercase                                  Change text to lowercase
--no-hyphenation                             If renderer should be splitting up words using a hyphen
                                             character (-)
--manga2eng                                  Render english text translated from manga with some
                                             additional typesetting. Ignores some other argument
                                             options
--gpt-config GPT_CONFIG                      Path to GPT config file, more info in README
--use-mtpe                                   Turn on/off machine translation post editing (MTPE) on
                                             the command line (works only on linux right now)
--save-text                                  Save extracted text and translations into a text file.
--save-text-file SAVE_TEXT_FILE              Like --save-text but with a specified file path.
--filter-text FILTER_TEXT                    Filter regions by their text with a regex. Example
                                             usage: --text-filter ".*badtext.*"
--skip-lang                                  Skip translation if source image is one of the provide languages, 
                                             use comma to separate multiple languages. Example: JPN,ENG
--prep-manual                                Prepare for manual typesetting by outputting blank,
                                             inpainted images, plus copies of the original for
                                             reference
--font-path FONT_PATH                        Path to font file
--gimp-font GIMP_FONT                        Font family to use for gimp rendering.
--host HOST                                  Used by web module to decide which host to attach to
--port PORT                                  Used by web module to decide which port to attach to
--nonce NONCE                                Used by web module as secret for securing internal web
                                             server communication
--ws-url WS_URL                              Server URL for WebSocket mode
--save-quality SAVE_QUALITY                  Quality of saved JPEG image, range from 0 to 100 with
                                             100 being best
--ignore-bubble IGNORE_BUBBLE                The threshold for ignoring text in non bubble areas,
                                             with valid values ranging from 1 to 50, does not ignore
                                             others. Recommendation 5 to 10. If it is too low,
                                             normal bubble areas may be ignored, and if it is too
                                             large, non bubble areas may be considered normal
                                             bubbles
```

<!-- Auto generated end -->

### Language Code Reference

Used by the `--target-lang` or `-l` argument.

```yaml
CHS: Chinese (Simplified)
CHT: Chinese (Traditional)
CSY: Czech
NLD: Dutch
ENG: English
FRA: French
DEU: German
HUN: Hungarian
ITA: Italian
JPN: Japanese
KOR: Korean
PLK: Polish
PTB: Portuguese (Brazil)
ROM: Romanian
RUS: Russian
ESP: Spanish
TRK: Turkish
UKR: Ukrainian
VIN: Vietnames
ARA: Arabic
SRP: Serbian
HRV: Croatian
THA: Thai
IND: Indonesian
FIL: Filipino (Tagalog)
```

### Translators Reference

| Name       | API Key | Offline | Note                                                   |
|------------|---------|---------|--------------------------------------------------------|
| <s>google</s>     |         |         |         Disabled temporarily                                               |
| youdao     | ✔️      |         | Requires `YOUDAO_APP_KEY` and `YOUDAO_SECRET_KEY`      |
| baidu      | ✔️      |         | Requires `BAIDU_APP_ID` and `BAIDU_SECRET_KEY`         |
| deepl      | ✔️      |         | Requires `DEEPL_AUTH_KEY`                              |
| caiyun     | ✔️      |         | Requires `CAIYUN_TOKEN`                                |
| gpt3       | ✔️      |         | Implements text-davinci-003. Requires `OPENAI_API_KEY` |
| gpt3.5     | ✔️      |         | Implements gpt-3.5-turbo. Requires `OPENAI_API_KEY`    |
| gpt4       | ✔️      |         | Implements gpt-4. Requires `OPENAI_API_KEY`            |
| papago     |         |         |                                                        |
| sakura     |         |         |Requires `SAKURA_API_BASE`                               |
| offline    |         | ✔️      | Chooses most suitable offline translator for language  |
| sugoi      |         | ✔️      | Sugoi V4.0 Models                                      |
| m2m100     |         | ✔️      | Supports every language                                |
| m2m100_big |         | ✔️      |                                                        |
| none       |         | ✔️      | Translate to empty texts                               |
| original   |         | ✔️      | Keep original texts                                    |

- API Key: Whether the translator requires an API key to be set as environment variable.
  For this you can create a .env file in the project root directory containing your api keys like so:

```env
OPENAI_API_KEY=sk-xxxxxxx...
DEEPL_AUTH_KEY=xxxxxxxx...
```

- Offline: Whether the translator can be used offline.

- Sugoi is created by mingshiba, please support him in https://www.patreon.com/mingshiba

### GPT Config Reference

Used by the `--gpt-config` argument.

```yaml
# The prompt being feed into GPT before the text to translate.
# Use {to_lang} to indicate where the target language name should be inserted.
# Note: ChatGPT models don't use this prompt.
prompt_template: >
  Please help me to translate the following text from a manga to {to_lang}
  (if it's already in {to_lang} or looks like gibberish you have to output it as it is instead):\n

# What sampling temperature to use, between 0 and 2.
# Higher values like 0.8 will make the output more random,
# while lower values like 0.2 will make it more focused and deterministic.
temperature: 0.5

# An alternative to sampling with temperature, called nucleus sampling,
# where the model considers the results of the tokens with top_p probability mass.
# So 0.1 means only the tokens comprising the top 10% probability mass are considered.
top_p: 1

# The prompt being feed into ChatGPT before the text to translate.
# Use {to_lang} to indicate where the target language name should be inserted.
# Tokens used in this example: 57+
chat_system_template: >
  You are a professional translation engine, 
  please translate the story into a colloquial, 
  elegant and fluent content, 
  without referencing machine translations. 
  You must only translate the story, never interpret it.
  If there is any issue in the text, output it as is.

  Translate to {to_lang}.

# Samples being feed into ChatGPT to show an example conversation.
# In a [prompt, response] format, keyed by the target language name.
#
# Generally, samples should include some examples of translation preferences, and ideally
# some names of characters it's likely to encounter.
#
# If you'd like to disable this feature, just set this to an empty list.
chat_sample:
  Simplified Chinese: # Tokens used in this example: 88 + 84
    - <|1|>恥ずかしい… 目立ちたくない… 私が消えたい…
      <|2|>きみ… 大丈夫⁉
      <|3|>なんだこいつ 空気読めて ないのか…？
    - <|1|>好尴尬…我不想引人注目…我想消失…
      <|2|>你…没事吧⁉
      <|3|>这家伙怎么看不懂气氛的…？

# Overwrite configs for a specific model.
# For now the list is: gpt3, gpt35, gpt4
gpt35:
  temperature: 0.3
```

### Using Gimp for rendering

When setting output format to {`xcf`, `psd`, `pdf`} Gimp will be used to generate the file.

On Windows this assumes Gimp 2.x to be installed to `C:\Users\<Username>\AppData\Local\Programs\Gimp 2`.

The resulting `.xcf` file contains the original image as the lowest layer and it has the inpainting as a separate layer.
The translated textboxes have their own layers with the original text as the layer name for easy access.

Limitations:

- Gimp will turn text layers to regular images when saving `.psd` files.
- Rotated text isn't handled well in Gimp. When editing a rotated textbox it'll also show a popup that it was modified
  by an outside program.
- Font family is controlled separately, with the `--gimp-font` argument.

### Api Documentation

<details closed>
<summary>API V2</summary>
<br>

```bash
# use `--mode api` to start a web server.
$ python -m manga_translator -v --mode api --use-gpu
# the api will be serving on http://127.0.0.1:5003
```

Api is accepting json(post) and multipart.
<br>
Api endpoints are `/colorize_translate`, `/inpaint_translate`, `/translate`, `/get_text`.
<br>
Valid arguments for the api are:

```
// These are taken from args.py. For more info see README.md
detector: String
ocr: String
inpainter: String
upscaler: String
translator: String 
target_language: String
upscale_ratio: Integer
translator_chain: String
selective_translation: String
attempts: Integer
detection_size: Integer // 1024 => 'S', 1536 => 'M', 2048 => 'L', 2560 => 'X'
text_threshold: Float
box_threshold: Float
unclip_ratio: Float
inpainting_size: Integer
det_rotate: Bool
det_auto_rotate: Bool
det_invert: Bool
det_gamma_correct: Bool
min_text_length: Integer
colorization_size: Integer
denoise_sigma: Integer
mask_dilation_offset: Integer
ignore_bubble: Integer
gpt_config: String
filter_text: String
overlay_type: String

// These are api specific args
direction: String // {'auto', 'h', 'v'}
base64Images: String //Image in base64 format
image: Multipart // image upload from multipart
url: String // an url string
```

</details>

Manual translation replaces machine translation with human translators.
Basic manual translation demo can be found at <http://127.0.0.1:5003/manual> when using web mode.
<details closed>
<summary>API</summary>
<br>

Two modes of translation service are provided by the demo: synchronous mode and asynchronous mode.\
In synchronous mode your HTTP POST request will finish once the translation task is finished.\
In asynchronous mode your HTTP POST request will respond with a `task_id` immediately, you can use this `task_id` to
poll for translation task state.

#### Synchronous mode

1. POST a form request with form data `file:<content-of-image>` to <http://127.0.0.1:5003/run>
2. Wait for response
3. Use the resultant `task_id` to find translation result in `result/` directory, e.g. using Nginx to expose `result/`

#### Asynchronous mode

1. POST a form request with form data `file:<content-of-image>` to <http://127.0.0.1:5003/submit>
2. Acquire translation `task_id`
3. Poll for translation task state by posting JSON `{"taskid": <task-id>}` to <http://127.0.0.1:5003/task-state>
4. Translation is finished when the resultant state is either `finished`, `error` or `error-lang`
5. Find translation result in `result/` directory, e.g. using Nginx to expose `result/`

#### Manual translation

POST a form request with form data `file:<content-of-image>` to <http://127.0.0.1:5003/manual-translate>
and wait for response.

You will obtain a JSON response like this:

```json
{
  "task_id": "12c779c9431f954971cae720eb104499",
  "status": "pending",
  "trans_result": [
    {
      "s": "☆上司来ちゃった……",
      "t": ""
    }
  ]
}
```

Fill in translated texts:

```json
{
  "task_id": "12c779c9431f954971cae720eb104499",
  "status": "pending",
  "trans_result": [
    {
      "s": "☆上司来ちゃった……",
      "t": "☆Boss is here..."
    }
  ]
}
```

Post translated JSON to <http://127.0.0.1:5003/post-manual-result> and wait for response.\
Then you can find the translation result in `result/` directory, e.g. using Nginx to expose `result/`.

</details>

## Next steps

A list of what needs to be done next, you're welcome to contribute.

1. Use diffusion model based inpainting to achieve near perfect result, but this could be much slower.
2. ~~**IMPORTANT!!!HELP NEEDED!!!** The current text rendering engine is barely usable, we need your help to improve
   text rendering!~~
3. Text rendering area is determined by detected text lines, not speech bubbles.\
   This works for images without speech bubbles, but making it impossible to decide where to put translated English
   text. I have no idea how to solve this.
4. [Ryota et al.](https://arxiv.org/abs/2012.14271) proposed using multimodal machine translation, maybe we can add ViT
   features for building custom NMT models.
5. Make this project works for video(rewrite code in C++ and use GPU/other hardware NN accelerator).\
   Used for detecting hard subtitles in videos, generating ass file and remove them completely.
6. ~~Mask refinement based using non deep learning algorithms, I am currently testing out CRF based algorithm.~~
7. ~~Angled text region merge is not currently supported~~
8. Create pip repository

## Support Us

GPU server is not cheap, please consider to donate to us.

- Ko-fi: <https://ko-fi.com/voilelabs>
- Patreon: <https://www.patreon.com/voilelabs>
- 爱发电: <https://afdian.net/@voilelabs>

  ### Thanks To All Our Contributors :
  <a href="https://github.com/zyddnys/manga-image-translator/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=zyddnys/manga-image-translator" />

</a>
