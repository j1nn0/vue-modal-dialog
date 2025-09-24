list:
	@grep "^[a-zA-Z\-]*:" Makefile | grep -v "grep" | sed -e 's/^/make /' | sed -e 's/://'

release-patch:
	npm version patch
	git push origin --force --tags

release-minor:
	npm version minor
	git push origin --force --tags

release-major:
	npm version major
	git push origin --force --tags
