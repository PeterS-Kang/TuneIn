import React from 'react'

const Users = ({code, users}) => {
  return (
    <>
        <div className='users'>
            <div className='user-box'>
                <h4 className='user-name'>
                    Room: {code}
                </h4>
            </div>
            {users.map((user) => {
                return (
                    <div className='user-box' key={user}>
                        <h4 className='user-name'>
                            {user}
                        </h4>
                    </div>
                    )
            })}
        </div>
    </>
  )
}

export default Users