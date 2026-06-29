#!/bin/sh
# Wrapper script for Mindbricks preview system
# Rename this file to 'serve' when serve is not available globally:
#   mv serve.sh serve && chmod +x serve
# This allows 'serve' command to work without global installation
exec ./node_modules/.bin/vite preview --port 3000 --host 0.0.0.0