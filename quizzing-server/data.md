```javascript
let data = {
    user: [
        {
            userId: 1718,
            session: [1234, 2124]
            nameFrist: 'Rani',
            nameLast: 'Jiang',
            email: 'ranivorous@gmail.com',
            password: 'password123',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        }
    ],
    quiz: [
        {
            quizId: 1,
            authUserId: 1,
            quizName: 'First_Quiz', 
            timeCreated: '1683125870',
            timeLastEdited: '1683125871',
            description: 'This is my quiz',
        }
    ],
};
```

[Optional] short description: Data is a local variable, which stores all informationed related to each user
created as well as each quiz created. The quizzes can be linked to a user via the authUserId key in their array. 
