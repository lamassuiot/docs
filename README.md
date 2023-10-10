# Lamassu IoT Documentation

<img src="https://www.lamassu.io/assets/brand/lamassu-brand.png" alt="Lamassu Logo" title="Lamassu" />

Lamassu is an IoT first PKI designed for industrial scenarios. This is the
official documentation repository for Lamassu IoT. This documentation is
published at [https://www.lamassu.io/docs/](https://www.lamassu.io/docs/).

## Contributing

Any PR that helps improve this documentation is welcome. Feel free to fork this
repository and submit a PR.

The documentation is written in Markdown supported by
[MkDocs](https://www.mkdocs.org/) and [Mike](https://github.com/jimporter/mike)
for site building and publishing.

A devcontainer (see .devcontainer/devcontainer.json) is included for a quick
startup of the edition environment using Visual Studio Code. The container
provides the following elements:

- Git
- Python 3
- Pip
- Python packages
  - mike
  - mkdocs-material
  - pymdown-extensions
  - mdformat
  - pymarkdownlnt

If you prefer to use your local host configuration and your preferred editor.
Please, follow the installation instructions for your local operating system for
these elements.

Clone this repo, edit the docs and see the result serving it locally by running
the following command from the root folder of your local copy of this
repository.

```bash
mike serve
```

This command starts a local http server that publishes the documentation at
http://localhost:8000/ for local review.

Once you are happy with your changes, please submit a PR to this repository for
review. Please, send the change to the appropriate branch:

- main, for the latest version of Lamassu.
- Version number, for fixes and additions to previous versions of Lamassu.

Please do not submit changes to the VERSION file unless you know what you are
doing. This is the tag for the version number during the publication phase.

### Format
A Markdown formatter is included in the edition environment but it is not enforced during PR validation. It is recommended that document editors use it to improve the document legibility.
The formatter works right with most of mkdocs constructs but it will fail to format the fille if "Content tabs" are used.

Use mdformat for apply formatting rules to the Markdown files. Use this command:

```bash
mdformat   <file>
```

### Linter
A Markdown linter is included in the edition environment but it is not enforced during PR validation. It is recommended that you use it to improve the overall quality of Markdown files. Use the linter with this command:

```bash
pymarkdownlnt scan <path-to-file>
```

## Publishing

The publishing process is automated via a Github Action workflow, which can be
launched manually by the repository owners. This action uses `mike` to publish
the documentation.

The workflow runs the following command for publishing the current branch
version.

```bash
VERSION = $(cat VERSION)
mike deploy $VERSION -b gh-pages --push
```

and the following one for setting the curent version as latest and default (only
for the main branch)

```bash
VERSION = $(cat VERSION)
mike deploy $VERSION latest -u
mike set-default $VERSION
```

## Admin

Administrators can use mike locally to fully manage the documentation, including
removing a version of the documentation.

```bash
VERSION = $(cat VERSION)
mike delete $VERSION -b gh-pages --push
```
