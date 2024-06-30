import os

print("-- Setting up the version --")

versionLabel = "@version:"
version_file = os.path.join(os.path.dirname(__file__), "../version")

with open(version_file, "r") as f:
    version = f.read().strip()

if version is None or version == "":
    raise RuntimeError(f"File without version: {version_file}")

print(f"Version to set: {version}")

# modify the __init__.py file with @version
file1 = os.path.join(os.path.dirname(__file__), "../__init__.py")
print(f"> File1: {file1}")

file1VersionFound = False
# lines = None
with open(file1, "r") as f:
    lines = f.readlines()
    for line in lines:
        if versionLabel in line:
            file1VersionFound = True
            lines[lines.index(line)] = f"{versionLabel} {version}\n"

if not file1VersionFound:
    raise RuntimeError(f"Version label not found in file: {file1}")

with open(file1, "w") as f2:
    f2.writelines(lines)

file2 = os.path.join(os.path.dirname(__file__), "../core/version.py")
print(f"> File2 {file2}")

with open(file2, "w") as f2:
    f2.writelines([f"version = \"{version}\"\n"])


# modify pyproject.toml file with @version
file3 = os.path.join(os.path.dirname(__file__), "../pyproject.toml")
print(f"> File3: {file3}")

file3VersionFound = False
# lines = None
with open(file3, "r") as f:
    lines = f.readlines()
    for line in lines:

        if "version = " in line:
            file3VersionFound = True
            lines[lines.index(line)] = f"version = \"{version}\"\n"

if not file3VersionFound:
    raise RuntimeError(f"Version label not found in file: {file3}")

with open(file3, "w") as f3:
    f3.writelines(lines)
