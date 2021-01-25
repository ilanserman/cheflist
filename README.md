# cheflist

Cheflist server instructions:

shutdown Mongod:
use admin
db.shutdownServer()
sudo mongod --port 27017 --dbpath /srv/mongodb/db0 --replSet rs0 --bind_ip localhost

using another shell then:
rs.initiate()
