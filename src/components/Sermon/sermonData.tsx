import { Sermon } from "@/types/blog";

const sermonData: Sermon[] = [
  {
    id: 1,
    title: "Finding Hope in Every Season",
    paragraph:
      "A message of faith, hope, and renewal to strengthen you through life's challenges.",
    image: "/images/blog/blog-01.jpg",
    author: {
      name: "Pastor James",
      image: "/images/blog/author-03.png",
      designation: "Lead Pastor",
    },
    tags: ["sermon"],
    publishDate: "2026",
  },
  {
    id: 2,
    title: "Living in Purpose and Grace",
    paragraph:
      "Practical teaching on how to follow Jesus in everyday life and make a lasting difference in your community.",
    image: "/images/blog/blog-02.jpg",
    author: {
      name: "Pastor Lydia",
      image: "/images/blog/author-02.png",
      designation: "Teaching Pastor",
    },
    tags: ["devotion"],
    publishDate: "2026",
  },
  {
    id: 3,
    title: "The Power of Prayer Together",
    paragraph:
      "Encouragement for families, friends, and church members to pray boldly and support one another in faith.",
    image: "/images/blog/blog-03.jpg",
    author: {
      name: "Pastor Samuel",
      image: "/images/blog/author-03.png",
      designation: "Pastoral Care",
    },
    tags: ["prayer"],
    publishDate: "2026",
  },
];
export default sermonData;
