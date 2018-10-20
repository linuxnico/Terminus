#!/usr/bin/env python
import sys
import polib

LANG = sys.argv[1]
APP_NAME = 'terminus'
ORIG = ('./src/lang/%s.%s.po' % (APP_NAME, LANG))
TGT = ('./src/js/_build/%s.dialog.%s.js' % (APP_NAME, LANG))

po = polib.pofile(ORIG)
if not po:
    exit(1)

with open(TGT, "w") as f:
    f.write("//Warning this file is autogenerated\n")
    f.write("var dialog={")
    for entry in po:
        if len(entry.msgid.split("\n")) > 2:
            msgid = ('"%s"') % entry.msgid.replace('"', '\"')
        else:
            msgid = entry.msgid.replace("\n", "")
            if " " in msgid:
                msgid = ('"%s"') % msgid.replace('"', '\\"')
        msgstr = entry.msgstr.replace(
            '\\', '\\\\').replace(
            '\\"', '\\\\"').replace(
            "\n", "\\n").replace(
            '"', '\\"')

        f.write('%s:"%s",\n' % (msgid, msgstr))
    f.write("};")
    f.write("const APP_NAME='%s';const LANG='%s';" % (APP_NAME, LANG))
