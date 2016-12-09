FROM debian

RUN mkdir cdn-dir
WORKDIR cdn-dir

ADD ./cdn-uploader.nar .

RUN chmod +x cdn-uploader.nar
RUN ./cdn-uploader.nar extract

CMD [".nar/bin/node", "index.js", "--help"]
