import random, string, pymysql

def randWord():
	s=''
	for i in range(random.randint(5,15)):
		s+=random.choice(string.ascii_lowercase)
	return s

def randMsg():
	s=''
	for i in range(random.randint(1,15)):
		s+=randWord()+' '
	return s.strip()

if __name__=="__main__":
	host, username, password = ('localhost','root','root')#input("Enter host, username & password: ").split()
	database = "chatApp"#input("Database: ")
	connection = pymysql.connect(host,username,password)
	cursor = connection.cursor()
	cursor.execute("show databases")
	dbs = cursor.fetchall()
	dbs = [db[0] for db in dbs]
	if database in dbs:
		print("found database")
		cursor.execute("use "+database)
	else:
		print("creating database")
		cursor.execute("create database "+database)
		cursor.execute("use "+database)
		cursor.execute("create table users(username varchar(15) primary key, password varchar(15) not null)")
		cursor.execute("create table messages(sender varchar(15) not null, reciever varchar(15) not null, message varchar(255) not null)")
	"""	
		#adding users
		for i in range(1000):
			cursor.execute("insert into users(username,password) values('"+randWord()+"','"+randWord()+"')")
		connection.commit()
	"""
	#adding messages
	cursor.execute("select username from users")
	users = [user[0] for user in cursor.fetchall()]
	print("please wait while adding messages to db")
	for i in range(1000):
		for j in range(1000):
			sender = random.choice(users)
			reciever = random.choice(users)
			cursor.execute("insert into messages values('"+sender+"','"+reciever+"','"+randMsg()+"')")
		print("batch "+i+"done")
		connection.commit()
	connection.close()