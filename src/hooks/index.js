import {useState, useEffect} from 'react';
import {firebase} from '../firebase';

const collatedTasksExist = () => {};

export const useTasks = selectedProject => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        let unsubscribe = firebase
            .firestore()
            .collection('tasks')
            .where('userId', '==', '1')
        
        // give me the tasks for the selected project
        unsubscribe = selectedProject && !collatedTasksExist(selectedProject)
            ? (unsubscribe = unsubscribe.where('projectId', '==', selectedProject))
            : (selectedProject === 'TODAY'
            ? (unsubscribe = unsubscribe.where('date', '==', moment().format('DD/MM/YYYY')))
            : selectedProject === 'INBOX' || selectedProject === 0 
            ? (unsubscribe = unsubscribe.where('date', '==', ''))
            : unsubscribe;
        
    }, [selectedProject]); // empty array means we only want this effect to run once, because this is the dependencies array. Since this effect depends on nothing changing, it will only run the first time.
}