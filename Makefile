.PHONY: bundle clean check test

LIB = lib
REPORTS = reports
MAKE_PACKAGE=webpack --progress --cache --bail

all: node_modules bundle

node_modules: package.json
	@rm -rf node_modules
	@npm install

test: node_modules check
	@jest

check:
	@eslint --ext .js,.jsx ./src

clean:
	@rm -rf $(LIB)
	@rm -rf $(REPORTS)

bundle:
	@$(MAKE_PACKAGE)
