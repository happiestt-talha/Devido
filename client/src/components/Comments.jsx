import React, { useEffect, useState } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import Comment from './Comment'


const Container = styled.div`
  color: ${({ theme }) => theme.text};
`
const Wrapper = styled.div`
  padding: 0.6rem 0.6rem;
  display: flex;
  gap:1rem ;

`
const Input = styled.input`
  background-color: transparent;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  padding: 0.5rem 0.5rem;
  width: 100%;
`
const Avatar = styled.img`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
`
const Button = styled.button`
  background-color: transparent;
  border: 1px solid #3ea6ff;
  border-radius: 3px;
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-inline: auto;
  transition: 0.3s ease;
  &:hover{
    background-color: #3ea6ff;
    color: white;
  }
`
const Comments = ({ videoId }) => {
  //eslint-disable-next-line
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/comments/${videoId}`)
        setComments(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    fetchComments()
  }, [videoId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      console.log('Submitting comment...')
      console.log('Comment: ', comment)
      const res = await axios.post(`/comment`, { desc: comment, videoId: videoId })
      console.log('Comment res: ', res.data)
      setComments(...comments, res.data)
      setComment('')
    } catch (err) {
      console.log(err)
    }
  }

  const handleChange = (e) => {
    setComment(e.target.value)
    console.log('OnChange: ', e.target.value)
  }
  return (
    <>
      <Container>

        <Wrapper>
          <Avatar src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
          <Input placeholder="Add a comment..." onChange={handleChange} value={comment} />
        </Wrapper>
        <Button onClick={handleSubmit}>Post</Button>
        {
        comments.length > 0 &&  comments.map((comment) => (
            <Comment key={comment._id} comment={comment} />
          ))
        }
      </Container>
    </>
  )
}

export default Comments