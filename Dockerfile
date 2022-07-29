FROM python:3.5

RUN apt-get update
RUN apt-get install -y nginx

RUN mkdir /app
WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY slapme slapme
COPY setup.py setup.py
RUN pip install .

COPY nginx.conf /etc/nginx/sites-enabled/default
COPY static static

COPY bin bin
CMD ["bin/run.sh"]
