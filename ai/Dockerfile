# install deps trước (cache layer)
COPY requirements.txt .
RUN pip install -r requirements.txt

# sau đó mới copy code
COPY app ./app
COPY main.py ./