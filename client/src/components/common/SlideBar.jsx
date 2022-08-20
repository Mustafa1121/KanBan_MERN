import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Drawer, IconButton, List, ListItem, ListItemButton, Typography } from '@mui/material'
import assets from '../../assets/index'
import { Box } from '@mui/system'
import { useNavigate, useParams } from 'react-router-dom'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import boardApi from '../../api/BoardApi'
import { setBoards } from '../../redux/features/boardSlice'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import FavoriteList from './FavoriteList'



function SlideBar() {
  const user = useSelector((state) => state.user.value)
  const boards = useSelector((state) => state.board.value)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { boardId } = useParams()
  const [activeIndex, setactiveIndex] = useState(0)

  const slidebarWidth = 250

  useEffect(() => {
    const getBoards = async () => {
      try {
        const res = await boardApi.getAll()
        dispatch(setBoards(res))
       
      } catch (err) {
        alert(err)
      }
    }
    getBoards()
  }, [dispatch])

  useEffect(() => {
    const activeItem = boards.findIndex(e => e.id === boardId)
    if (boards.length > 0 && boardId === undefined) {
      navigate(`/boards/${boards[0].id}`)
    }
    setactiveIndex(activeItem)
  }, [boards,boardId,navigate])

  

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }
  
  const addBoard = async () => {
    try {
      const res = await boardApi.create()
      const newList = [...boards,res]
      dispatch(setBoards(newList))
      navigate(`/boards/${res.id}`)
    } catch (error) {
      alert(error)
    }
  }

  const onDragEnd = async ({source,destination}) => {
    const newList = [...boards]
    const [removed] = newList.splice(source.index,1)
    newList.splice(destination.index,0,removed)

    const activeItem = newList.findIndex(e => e.id === boardId)
    setactiveIndex(activeItem)
    dispatch(setBoards(newList))

    try {
      await boardApi.updatePosition({boards:newList})
    } catch (error) {
      alert(error)
    }
  }

  return (
    <Drawer
      container={window.document.body}
      variant='permanent'
      open={true}
      sx={{
        width: slidebarWidth,
        height: '100%',
        '& > div': { borderRight: 'none' }
      }}
    >
      <List
        disablePadding
        sx={{
          width: slidebarWidth,
          height: '100vh',
          backgroundColor: assets.colors.secondary
        }}
      >
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          >
            <Typography variant='body2' fontWeight='700'>
              {user.username}
            </Typography>
            <IconButton onClick={logout}>
              <LogoutOutlinedIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <Box sx={{
          paddingTop: '10px'
        }} />
        <FavoriteList />
        
        <Box sx={{
          paddingTop: '10px'
        }} />
        <ListItem>
          <Box sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          >
            <Typography variant='body2' fontWeight='700'>
              Private
            </Typography>
            <IconButton onClick={addBoard}>
              <AddBoxOutlinedIcon fontSize='small' />
            </IconButton>
          </Box>
        </ListItem>
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable key={'list-board-droppable-key'} droppableId={'list-board-droppable'}>
                {
                  (provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {
                        boards.map((item,index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                              {
                                (provided,snapshot) => (
                                  <ListItemButton
                                  ref={provided.innerRef}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  selected={index === activeIndex}
                                  component={Link}
                                  to={`/boards/${item.id}`}
                                  sx={{
                                    pl: '20px',
                                    cursor: snapshot.isDragging ? 'grap' : 'pointer!important'
                                  }}
                                  >
                                    <Typography
                                    variant='body2'
                                    fontWeight='700'
                                    sx={{ whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}
                                    >
                                      {item.icon} {item.title}
                                    </Typography>
                                  </ListItemButton>
                                )
                              }
                          </Draggable>
                        ))
                      }
                      {provided.placeholder}
                    </div>
                  )
                }
            </Droppable>
        </DragDropContext>
      </List>
    </Drawer>
  )
}

export default SlideBar