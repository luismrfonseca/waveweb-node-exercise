# Waveweb tech assignment
You need to run ```npm i``` to install all dependences and run ```npm start``` to run the project. 

# API Endpoints 


Endpoint GET - ``` http://localhost:3000/authors ``` - Get all authors with articles

Endpoint POST - ``` http://localhost:3000/articles ``` - Create a new article

Body example:
```
{
    "title": "O Leitor",
    "author": "Bernhard Schlink",
    "country_code": "FR"
}
```

Endpoint PUT - ``` http://localhost:3000/articles ``` - Update articles and authors

Body example:
```
{
    "articles" : [
        {
            "id": 8,
            "title": "Diário de Inverno"
        },
        {
            "id": 7,
            "author_id": 12
        }
    ],
    "authors" : [
        {
            "id": 12,
            "name": "David Borges",
            "country_code": "PT"
        }
    ]
}
```

Endpoint DELETE - ``` http://localhost:3000/articles ``` - Delete articles

Body example:
```
{
    "articles": [1,7,8]
}
```



Endpoint pagination GET ``` http://localhost:3000/endpoint_a?per_page=5&page=2&order=name&sort=desc ``` - GET authors with pagination
