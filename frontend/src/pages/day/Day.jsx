import React from 'react'
import './day.scss'
import Today from '../../components/today/Today'
import Sidebar from '../../components/sidebar/Sidebar'

const Day = ({ tags, onAddTag, onUpdateTag, onDeleteTag }) => {
  return (
    <div className="day">
        <Sidebar 
          tags={tags}
          onAddTag={onAddTag}
          onUpdateTag={onUpdateTag}
          onDeleteTag={onDeleteTag}
        />
        <div className="dayContainer">
            <div className="today-title">
                <p>Today</p>
            </div>
            <Today tags={tags}/>
        </div>
    </div>
  );
}

export default Day
