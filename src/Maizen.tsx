/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Button,
  TouchableWithoutFeedback,
  Dimensions,
  ImageBackground,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {supabase} from './utils/SupabaseConfig';
import {useState, useEffect} from 'react';

interface ItemProps {
  id: string;
  title: string;
  value: number;
  income: boolean;
  date: Date;
}

function Item({title, value, income, date}: ItemProps) {
  const dateObj = new Date(date);
  const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}/${dateObj.getFullYear()}`;

  return (
    <View style={styles.item}>
      <View>
        <Text style={[income ? styles.income : styles.outcome, {fontSize: 15}]}>
          {formattedDate}
        </Text>
        <Text style={[income ? styles.income : styles.outcome, {fontSize: 15}]}>
          {title}
        </Text>
      </View>
      <Text style={income ? styles.income : styles.outcome}>{value}</Text>
    </View>
  );
}

const Maizen = () => {
  const [isIncome, setIsIncome] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<ItemProps | null>(null); // Assuming ItemProps is your item type
  const [note, setNote] = useState('');
  const [inputValue, setInputValue] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);
  const [history, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [displayMonth, setDisplayMonth] = useState(currentMonth);
  const [displayYear, setDisplayYear] = useState(currentYear);

  const handleItemPress = (item: ItemProps) => {
    setCurrentItem(item);
    setNote(item.title); // Assuming you want to use the title as the note
    setInputValue(item.value / 1000); // Adjust this if your value needs formatting
    setEditModalVisible(true);
  };

  const handlePrevMonth = () => {
    const newDisplayMonth = displayMonth === 0 ? 11 : displayMonth - 1;
    const newDisplayYear = displayMonth === 0 ? displayYear - 1 : displayYear;

    setDisplayMonth(newDisplayMonth);
    setDisplayYear(newDisplayYear);

    // Now pass the updated values directly to getBalance
    getBalance(newDisplayMonth, newDisplayYear);
    console.log(currentMonth, currentYear);
    //console.log(newDisplayMonth, newDisplayYear); // This will now log the correct, updated values
  };

  const handleNextMonth = () => {
    const newDisplayMonth = displayMonth === 11 ? 0 : displayMonth + 1;
    const newDisplayYear = displayMonth === 11 ? displayYear + 1 : displayYear;

    setDisplayMonth(newDisplayMonth);
    setDisplayYear(newDisplayYear);

    // Now pass the updated values directly to getBalance
    getBalance(newDisplayMonth, newDisplayYear);
    //console.log(currentMonth, currentYear);
    //console.log(newDisplayMonth, newDisplayYear); // This will now log the correct, updated values
  };

  const getData = React.useCallback(async () => {
    const {data: fetchedData, error} = await supabase
      .from('Maizen')
      .select('*');
    if (error) {
      console.log(error);
    } else {
      //console.log(fetchedData);
      setData(fetchedData || []);
    }
  }, []);
  const getBalance = React.useCallback(async (month: number, year: number) => {
    //console.log('Month:', month, 'Year:', year);
    const {data, error} = await supabase.from('Balance').select('*');
    if (error) {
      console.log(error);
    } else {
      //console.log('Balance:', data);
    }
    const totalBalance = data?.reduce((acc, item) => {
      return acc + item.MaizenIncome - item.MaizenOutcome;
    }, 0);
    setBalance(totalBalance);

    setTotalIncome(
      data?.find(item => item.month === month && item.year === year)
        ?.MaizenIncome || 0,
    );

    setTotalOutcome(
      data?.find(item => item.month === month && item.year === year)
        ?.MaizenOutcome || 0,
    );
  }, []);

  const insertData = async () => {
    const {data, error} = await supabase
      .from('Maizen')
      .insert([{title: note, value: inputValue * 1000, income: isIncome}]);
    if (error) {
      console.log(error);
      return;
    } else {
      await getData();
      await getBalance(currentMonth, currentYear);
    }
  };

  // const comlumnToUpdate = isIncome ? 'MaizenIncome' : 'MaizenOutcome';
  // //console.log(comlumnToUpdate);
  // const valueToUpdate = isIncome
  //   ? totalIncome + inputValue * 1000
  //   : totalOutcome + inputValue * 1000;
  // //console.log(valueToUpdate);
  // const {data: updateData, error: updateError} = await supabase
  //   .from('Balance')
  //   .update({[comlumnToUpdate]: valueToUpdate})
  //   .match({month: currentMonth, year: currentYear});
  // if (updateError) {
  //   console.log(updateError);
  //   return;
  // } else {
  //   //console.log(currentMonth, currentYear);
  //
  // }

  const updateData = async (id: string, title: string, value: number) => {
    const {data, error} = await supabase
      .from('Maizen')
      .update({title, value: value * 1000})
      .match({id});
    if (error) {
      console.log(error);
      return;
    } else {
      await getData();
      await getBalance(currentMonth, currentYear);
    }

    // const comlumnToUpdate = currentItem?.income
    //   ? 'MaizenIncome'
    //   : 'MaizenOutcome';
    // const valueToUpdate = currentItem?.income
    //   ? totalIncome - currentItem.value + value * 1000
    //   : totalOutcome - currentItem.value + value * 1000;
    // const {data: updateData, error: updateError} = await supabase
    //   .from('Balance')
    //   .update({[comlumnToUpdate]: valueToUpdate})
    //   .match({month: currentMonth, year: currentYear});
    // if (updateError) {
    //   console.log(updateError);
    //   return;
    // } else {

    // }
  };

  const deleteData = async (id: string, value: number) => {
    const {data: deleteData, error} = await supabase
      .from('Maizen')
      .delete()
      .match({id});
    if (error) {
      console.log(error);
      return;
    } else {
      await getData();
      await getBalance(currentMonth, currentYear);
    }

    // const comlumnToUpdate = currentItem?.income
    //   ? 'MaizenIncome'
    //   : 'MaizenOutcome';
    // const valueToUpdate = currentItem?.income
    //   ? totalIncome - value * 1000
    //   : totalOutcome - value * 1000;
    // const {data: updateData, error: updateError} = await supabase
    //   .from('Balance')
    //   .update({[comlumnToUpdate]: valueToUpdate})
    //   .match({month: currentMonth, year: currentYear});
    // if (updateError) {
    //   console.log(updateError);
    //   return;
    // } else {

    // }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      getBalance(displayMonth, displayYear);
      getData();
    }, 2000); // 2000 milliseconds = 2 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [getBalance, getData, displayMonth, displayYear]);

  useEffect(() => {
    const filtered = history
      .filter(item => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getMonth() === displayMonth &&
          itemDate.getFullYear() === displayYear
        );
      })
      .reverse();
    setFilteredData(filtered);
  }, [history, displayMonth, displayYear]);

  return (
    <ImageBackground
      source={require('../assets/image/background1.jpg')}
      style={styles.imageContainer}>
      <View style={styles.outerContainer}>
        <View style={styles.container}>
          <Text
            style={[styles.text, {fontSize: 35, fontFamily: 'Inter-Black'}]}>
            Maize's Balance:
          </Text>
          <Text style={[styles.text, {fontSize: 25, fontFamily: 'Inter-Bold'}]}>
            {balance}₫
          </Text>
          <Text
            style={[styles.text, {fontSize: 25, fontFamily: 'Inter-SemiBold'}]}>
            {new Date(displayYear, displayMonth).toLocaleString('default', {
              month: 'long',
            })}{' '}
            {displayYear}
          </Text>
          <View style={styles.monthlyContainer}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Icon name="arrow-back-ios" size={35} color="#fff" />
            </TouchableOpacity>
            <FlatList
              style={{marginVertical: 20, width: '80%', marginHorizontal: 0}}
              data={[...filteredData].filter(item => {
                const itemDate = new Date(item.date);
                return (
                  itemDate.getMonth() === displayMonth &&
                  itemDate.getFullYear() === displayYear
                );
              })}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => handleItemPress(item)}>
                  <Item
                    id={item.id}
                    title={item.title}
                    value={item.value}
                    income={item.income}
                    date={item.date}
                  />
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
            <TouchableOpacity onPress={handleNextMonth}>
              <Icon name="arrow-forward-ios" size={35} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.total}>
            <Text style={styles.income}>
              Earn:{'\n'}
              {totalIncome}₫
            </Text>
            <Text style={styles.outcome}>
              Spend:{'\n'}
              {totalOutcome}₫
            </Text>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={() => {
                setModalVisible(true);
                setIsIncome(true);
              }}>
              <Text style={{fontSize: 50, lineHeight: 60, color: '#219C90'}}>
                +
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.minusButton}
              onPress={() => {
                setModalVisible(true);
                setIsIncome(false);
              }}>
              <Text style={{fontSize: 50, lineHeight: 60, color: '#ee4e4e'}}>
                -
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}>
          <TouchableWithoutFeedback
            onPress={() => {
              setModalVisible(false);
              setInputValue(0);
              setNote('');
            }}>
            <View style={styles.fullScreenModal}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalView}>
                  <Text style={{color: 'black'}}>Note</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setNote(text)}
                    value={note}
                  />
                  <Text style={{color: 'black'}}>Value (x1000)</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setInputValue(Number(text))}
                    value={inputValue.toString()}
                    keyboardType="numeric"
                  />
                  <Button
                    title="Submit"
                    onPress={() => {
                      insertData(); // Handle the input value
                      setModalVisible(!modalVisible); // Close modal
                      getData();
                      setInputValue(0);
                      setNote('');
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => {
            setEditModalVisible(false);
          }}>
          <TouchableWithoutFeedback
            onPress={() => {
              setEditModalVisible(false);
              setInputValue(0);
              setNote('');
            }}>
            <View style={styles.fullScreenModal}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.modalView}>
                  <Text style={{color: 'black'}}>Note</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setNote(text)}
                    value={note}
                  />
                  <Text style={{color: 'black'}}>Value (x1000)</Text>
                  <TextInput
                    style={styles.input}
                    onChangeText={text => setInputValue(Number(text))}
                    value={inputValue.toString()}
                    keyboardType="numeric"
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      width: '100%',
                    }}>
                    <Button
                      title="Update"
                      onPress={() => {
                        updateData(currentItem.id, note, inputValue); // Assuming updateData function exists
                        setEditModalVisible(!editModalVisible); // Close modal
                        getData(); // Refresh data
                      }}
                    />
                    <Button
                      title="Delete"
                      onPress={() => {
                        deleteData(currentItem.id, inputValue); // Assuming deleteData function exists
                        setEditModalVisible(!editModalVisible); // Close modal
                        getData(); // Refresh data
                      }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </ImageBackground>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  outerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    width: '100%',
    height: '95%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
    opacity: 0.5,
  },
  monthlyContainer: {
    height: '65%',
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  direction: {
    fontSize: 20,
  },
  balance: {
    width: '70%',
    alignSelf: 'center',
  },
  text: {
    color: '#fff',
  },
  income: {
    fontSize: 18,
    color: '#219C90',
    fontFamily: 'Inter-SemiBold',
  },
  outcome: {
    fontSize: 20,
    color: '#ee4e4e',
    fontFamily: 'Inter-SemiBold',
  },
  total: {
    width: '70%',
    paddingBottom: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  button: {
    width: '75%',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  plusButton: {
    width: 75,
    height: 75,
    borderRadius: 36,
    backgroundColor: '#9ad5bf',
    justifyContent: 'center',
    alignItems: 'center',
  },
  minusButton: {
    width: 75,
    height: 75,
    borderRadius: 36,
    backgroundColor: '#ffe6e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 5,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 22,
    width: screenWidth / 2,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '70%',
    padding: 20,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    padding: 5,
    width: '100%', // Adjust as needed
    color: 'black',
    borderRadius: 10,
  },
  fullScreenModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
  },
});

export default Maizen;
