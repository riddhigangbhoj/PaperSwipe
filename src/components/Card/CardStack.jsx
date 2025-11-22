import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import TinderCard from 'react-tinder-card'
import PaperCard from './PaperCard'

const CardStack = forwardRef(({ papers, onSwipe, onCardClick }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(papers.length - 1)
  const cardRefs = useRef([])

  useImperativeHandle(ref, () => ({
    swipe: (dir) => {
      const currentCardRef = cardRefs.current[currentIndex]
      if (currentCardRef) {
        currentCardRef.swipe(dir)
      }
    }
  }))

  const handleSwipe = (direction, paper, index) => {
    onSwipe(direction, paper)
    setCurrentIndex(index - 1)
  }

  const handleCardLeftScreen = (dir, paper) => {
    console.log(`${paper.title} left the screen in direction: ${dir}`)
  }

  return (
    <div className="relative w-full max-w-md h-[600px] mx-auto">
      {papers.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-lg">No more papers to show</p>
        </div>
      ) : (
        papers.map((paper, index) => (
          <TinderCard
            ref={(el) => (cardRefs.current[index] = el)}
            key={paper.id}
            onSwipe={(dir) => handleSwipe(dir, paper, index)}
            onCardLeftScreen={(dir) => handleCardLeftScreen(dir, paper)}
            preventSwipe={['up', 'down']}
            className="absolute w-full h-full"
          >
            <PaperCard paper={paper} onClick={() => onCardClick(paper)} />
          </TinderCard>
        ))
      )}
    </div>
  )
})

export default CardStack
