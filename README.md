# WeJapa Internship Node filesystem tasks

## Docs
1. Default url '/' returns
    ```
    Welcome to the notes API
    ```
0. To get a particular note, use the `title` and `directory`
    ```
    /search?title=stuff&directory=stuffdir
    ```
0. To add a new note, use the `POST` verb and data in body
    ```
    {
        "title": "note4",
        "directory": "stuff",
        "content": "Blah blah"
    }
    ```
0. To delete a note, use the `DELETE` verb with the note's title and directory in a query string
```/?title=note4&directory=stuff```
0. To list a summary of notes, use the summary endpoint
`/summary`
0. To edit a note, use the `PATCH` verb and data in the body
    ```
    {
        "currentTitle": "note4",
        "directory": "stuff",
        "newTitle": "Blah-blah"
    }
    ```