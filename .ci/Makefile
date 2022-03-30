SHELL = /bin/bash -eo pipefail

release-notes: validate-branch-name
	@gh release list
	@gh \
		release \
		create $(BRANCH_NAME) \
		--title '$(BRANCH_NAME)' \
    --draft \
    --generate-notes

validate-branch-name:
ifndef BRANCH_NAME
	$(error BRANCH_NAME is undefined)
endif
