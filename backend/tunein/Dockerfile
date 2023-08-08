#Base image
FROM python:3.11.4-slim-buster

RUN apt-get update && apt-get install -y \
  default-libmysqlclient-dev \
  pkg-config \
  gcc \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

#Set work directory
WORKDIR /app

#Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1


#Install dependencies
COPY ./requirements.txt .
RUN pip3 install -r requirements.txt

COPY . .


CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]