const fetch = require("isomorphic-fetch");
const express = require('express');
const { escapeRegExp } = require("lodash");
const e = require("express");
const app = express();

/* QUESTION 1 - Get all posts ordered by number of comments */
app.get('/topPosts', async (req,res) => {

    try {

        const fetchComments = await fetch('https://jsonplaceholder.typicode.com/comments');
        let comments = await fetchComments.json();
            
        // Grouping comments by postId
        let posts = comments.reduce((obj, comment) => {
            obj[comment.postId] = (obj[comment.postId] || 0) + 1;

            return obj;
        },{});

        // Changing object to array
        let postsArray = await Promise.all(Object.keys(posts).map(async (key) => {
            const fetchPost = await fetch(`https://jsonplaceholder.typicode.com/posts/${key}`);
            const post = await fetchPost.json(); 
            return {
                post_id: key,
                post_title: post.title,
                post_body: post.body,
                total_number_of_comments: posts[key],
            } 
        }));

        // Sorting by number of comments
        postsArray.sort((a,b) => b.total_number_of_comments - a.total_number_of_comments);

        res.send(postsArray);

    } catch (err) {
        console.log(err);
    }


});


/* QUESTION 2 - Filter comments based on requested field and query */
app.get('/searchComments/:field/:query', async (req,res) => {
    try {

        // Make sure field name does not contain special characters
        const field = escapeRegExp(req.params.field);
        const query = req.params.query.toLowerCase();

        // Fetch all comments
        const fetchComments = await fetch('https://jsonplaceholder.typicode.com/comments');
        let comments = await fetchComments.json();

        // Filter comments based on available field
        const filteredComments = comments.filter((comment) => {
            if (field === "postId" || field === "id") {
                return comment[field] == query;
            } else {
                return comment[field].includes(query);
            }
        });

        res.send(filteredComments);
    } catch (err) {
        console.log(err);
    }
});

app.listen(3000, () => console.log('Listening on port 3000'));