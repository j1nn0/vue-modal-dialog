list:
	@grep "^[a-zA-Z\-]*:" Makefile | grep -v "grep" | sed -e 's/^/make /' | sed -e 's/://'

push:
	git push origin main --tags

release-patch:
	npm version patch
	@make push

release-minor:
	npm version minor
	@make push

release-major:
	npm version major
	@make push
