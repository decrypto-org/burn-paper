SOURCES := $(shell find . -iname '*.tex' -o -iname '*.bib' -o -iname '*.sty' -o -ipath '*figures/*.pdf')

.PHONY: all clean

all: main.pdf

burn.pdf: $(SOURCES)
	rm -f *.glsdefs
	pdflatex burn.tex
	bibtex burn
	pdflatex burn.tex
	pdflatex burn.tex

clean:
	rm -f *.aux *.log *.out *.cfg *.glo *.idx *.toc *.ilg *.ind *.lof *.lot *.bbl *.blg *.gls *.cut *.hd *.dvi *.ps *.thm *.rpi *.d *.fls *.pyc *.fdb_latexmk *.sls *.slo *.slg *.glsdefs *.gls *.glg *.glo *.ist
	rm -Rf latex.out
	rm -Rf burn.pdf
