NuGet Update -self

rmdir /s /q content
mkdir content
copy ..\dist\* content
del angular-file-upload.*

NuGet Pack Package.nuspec

for %%f in (angular-file-upload.*) do (
	NuGet Push %%f
	rmdir /s /q content
	del %%f
)

