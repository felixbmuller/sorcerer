import readline
import requests

if __name__ == "__main__":
    while True:
        i = input("> ")
        parts = i.split()
        if parts[0] == "add":
            print(requests.get(f"http://127.0.0.1:8000/rest/addplayer/?player={parts[1]}").text)
        elif parts[0] == "remove":
            print(requests.get(f"http://127.0.0.1:8000/rest/removeplayer/?player={parts[1]}").text)
        elif parts[0] == "start":
            print(requests.get(f"http://127.0.0.1:8000/rest/startgame/").text)
        elif parts[0] == "stop":
            print(requests.get(f"http://127.0.0.1:8000/rest/stopgame/").text)
        elif parts[0] == "announce":
            print(requests.get(f"http://127.0.0.1:8000/rest/announcetricks/?player={parts[1]}&n={parts[2]}").text)
        elif parts[0] == "play":
            print(requests.get(f"http://127.0.0.1:8000/rest/playcard/?player={parts[1]}&card={parts[2]}").text)
        elif parts[0] == "exit":
            exit(0)
        else:
            print("invalid command")