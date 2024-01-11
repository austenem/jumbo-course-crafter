# Jumbo Course Crafter

Program for finding all possible schedules from a given list of courses at Tufts
University that considers given priorities, sub-categories, and course-loads.

## Description

This program relies on up-to-date course information from the Tufts Student 
Information System, which it scrapes from the site as needed. It uses a
randomized backtracking algorithm to find all possible schedules.

## Getting Started

First, install all dependencies with:

```bash
npm install
```

Then add a .env file to the root directory with a MONGODB_URI variable.

In order to retrieve updated course data from the Tufts SIS and store it in
your MongoDB collection, run:

```bash
npm run get-courses
```

Finally, run the development server:

```bash
npm run dev
```

## Authors

Written by Austen Money.
