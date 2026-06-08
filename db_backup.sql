--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: about_paragraphs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: home_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.home_sections VALUES (1, 'Data and ML', 'I started in data engineering and warehousing, and I''m interesting in learning how data is related to AI and ML, learning and  building systems that learn and scale.', 'fa-solid fa-brain', 0, true);
INSERT INTO public.home_sections VALUES (2, 'Crafting Beautiful Systems', 'I care about developer experience, design, and performance — because great products feel great to use.', 'fa-solid fa-code', 1, true);
INSERT INTO public.home_sections VALUES (3, 'Shipped and Learning', 'Always shipping, always learning — exploring ML, LLMs, and intelligent automation.', 'fa-solid fa-robot', 2, true);


--
-- Data for Name: kanban_columns; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kanban_columns VALUES (1, 'To Do', 0);
INSERT INTO public.kanban_columns VALUES (2, 'In Progress', 1);
INSERT INTO public.kanban_columns VALUES (3, 'Done', 2);


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.projects VALUES (16, 'Blog WebApp', 'This project is a Node.js-based blog platform designed to demonstrate a solid understanding of web development and authentication functionalities. The primary goal was to implement a secure, user-friendly interface where users can explore, create, and interact with blog posts.

Features:
User Authentication: The application includes a robust authentication system, ensuring that only registered users can create new blog posts. If an unauthenticated user attempts to create a post, they are redirected to the signup page.

Blog Post Creation: Authenticated users can create new blog posts directly from the interface. The application supports adding tags, feature images, and other metadata to enhance the post''s presentation.

Responsive Design: The platform is fully responsive, offering a seamless experience across devices, including desktops and mobile devices.

Purpose:
The primary purpose of this project was to demonstrate proficiency in Node.js application development with a focus on integrating user authentication. The application ensures that user interactions are secure and that content creation is restricted to authenticated users, highlighting the importance of secure and user-specific functionality in modern web applications.

NOTE: I currently do not have a demo video for the app.', '/uploads/1724294504495-Screenshot 2024-08-21 at 10.19.41â¯PM.png', '/uploads/1724294504509-Screenshot 2024-08-21 at 10.19.25â¯PM.png', '/uploads/1724294504512-Screenshot 2024-08-21 at 10.19.02â¯PM.png', '/uploads/1724294504513-Screenshot 2024-08-18 at 9.03.02â¯PM.png', 'https://github.com/ralharas/blog-website', 'https://github.com/ralharas/blog-website', 'Clone the repository: git clone https://github.com/ralharas/blog-website', 'Navigate to the project directory and install node modules.', 'Then run the webapp in your terminal "nodemon app.js" or "node app.js". If you have no idea how to do the above steps and would like to still try out the project, please reach out to me using the contact me form.');
INSERT INTO public.projects VALUES (17, 'Book notes', 'The Book Tracker application is a comprehensive tool designed to help users manage and keep track of their book collections. The app allows users to add new books, edit existing entries, view detailed notes, and delete books as needed. Each book entry includes a cover image, title, author, rating, and personal notes, providing a holistic view of the user''s reading history.

Purpose:
The primary purpose of this project is to demonstrate a deep understanding of API integrations and how to have an app interact seamlessly with external APIs. The Book Tracker leverages various APIs to fetch book data, including cover images and other metadata, making it a robust and dynamic application. By implementing these API interactions, the project showcases the ability to create a user-friendly interface that enhances the user''s experience while interacting with their book collection.

Features:
Add New Book: Allows users to input a new book into their collection, complete with details such as title, author, ISBN, rating, read date, and personal notes.

Edit Book Details: Users can update the details of an existing book, ensuring their collection is always accurate and up-to-date.
Delete Book: Provides the ability to remove books from the collection.

View Notes: Users can add and view detailed notes on each book, enhancing the reading experience.', '/uploads/1724295052618-Screenshot 2024-08-18 at 9.06.01â¯PM.png', '/uploads/1724295052619-Screenshot 2024-08-18 at 9.03.48â¯PM.png', '/uploads/1724295052619-Screenshot 2024-08-18 at 9.06.21â¯PM.png', '/uploads/1724295052620-Screenshot 2024-08-18 at 9.03.43â¯PM.png', 'https://github.com/ralharas/book-notes', 'https://github.com/ralharas/book-notes', ' Clone the repository into your local machine git clone https://github.com/ralharas/book-notes and then navigate to the project directory in your terminal', 'install node modules by running the command npm install -y', 'run node app.js or nodemon app.js (if supported or installed). ');


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ticket_activity; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: ticket_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: about_paragraphs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.about_paragraphs_id_seq', 1, false);


--
-- Name: home_sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.home_sections_id_seq', 3, true);


--
-- Name: kanban_columns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kanban_columns_id_seq', 3, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 18, true);


--
-- Name: ticket_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_activity_id_seq', 7, true);


--
-- Name: ticket_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_comments_id_seq', 1, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

