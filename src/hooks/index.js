import {useState, useEffect} from 'react';
import {firebase} from '../firebase';
import {collatedTasksExist} from '../helpers';
import moment from 'moment';

export const useTasks = selectedProject => {
    const [tasks, setTasks] = useState([]);
    const [archivedTasks, setArchivedTasks] = useState([]);

    useEffect(() => {
        let unsubscribe = firebase
            .firestore()
            .collection('tasks')
            .where('userId', '==', '1')
        
        // give me the tasks for the selected project
        unsubscribe = selectedProject && !collatedTasksExist(selectedProject)
            ? (unsubscribe = unsubscribe.where('projectId', '==', selectedProject))
            : selectedProject === 'TODAY'
            ? (unsubscribe = unsubscribe.where('date', '==', moment().format('DD/MM/YYYY')))
            : selectedProject === 'INBOX' || selectedProject === 0 
            ? (unsubscribe = unsubscribe.where('date', '==', ''))
            : unsubscribe;


        unsubscribe = unsubscribe.onSnapshot(snapshot => {
            const newTasks = snapshot.docs.map(task => ({
                id: task.id,
                ...tasks.data(),
            }))

            setTasks(
                selectedProject === 'NEXT_7'
                ? newTasks.filter(
                    task => moment(task.date, 'DD-MM-YYYY').diff(moment(), 'days') <= 7 &&
                    !task.archived
                )
                : newTasks.filter(task => !task.archived)
            );

            setArchivedTasks(newTasks.filter(task => !!task.archived))
        });

        return () => unsubscribe();
    }, [selectedProject]); // empty array means we only want this effect to run once, because this is the dependencies array. Since this effect depends on nothing changing, it will only run the first time.

    return { tasks, archivedTasks };
};
