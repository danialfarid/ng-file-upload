#!/bin/sh
# add a simple 'nuget' command to Mac OS X under Mono
# get NuGet.exe binary from http://nuget.codeplex.com/releases/view/58939
# get Microsoft.Build.dll from a Windows .NET 4.0 installation
# copy to /usr/local/bin and Robert is your father's brother....
#
PATH=/usr/local/bin:$PATH
mono --runtime=v4.0 /usr/local/bin/NuGet.exe $*
