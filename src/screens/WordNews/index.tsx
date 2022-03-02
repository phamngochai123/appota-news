import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as rssParser from 'react-native-rss-parser';
import axios from 'axios';
import moment from 'moment';
import {Colors, Images, TextSize} from '../../utils';

const windowDimensions = Dimensions.get('window');
const {width: widthWindow, height: heightWindow} = windowDimensions;
const withOfItem = widthWindow * 0.82;
const withOfImage = withOfItem - 20;

const startOfImage: String = '<img src="';
const endOfImage: String = '" ></a>';
const tabKey = {
  list: 'list',
  saved: 'saved',
};
type Props = {};
type PropsSaveIcon = {
  isSaved?: boolean;
};

const openURL = link => {
  Linking.canOpenURL(link).then(isOpen => {
    if (isOpen) {
      Linking.openURL(link);
    }
  });
};

const SaveIcon: React.FC<PropsSaveIcon> = ({isSaved = false}) => {
  return (
    <Image
      source={!isSaved ? Images.tagSave : Images.tagSaved}
      style={{width: 50, height: 50}}
    />
  );
};

const WordNews: React.FC<Props> = () => {
  const [listNews, setListNews] = React.useState([]);
  const [listSaved, setListSaved] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState(tabKey.list);
  const getData = async () => {
    try {
      setLoading(true);
      console.log('getData=>');
      const ab = await axios.get('https://vnexpress.net/rss/tin-moi-nhat.rss', {
        headers: {
          'Content-Type': 'application/text',
        },
      });
      console.log('rssData=>', ab);
      const dataParse = await rssParser.parse(ab.data);
      console.log('dataParser=>', dataParse);
      if (dataParse && dataParse.items) {
        setListNews(dataParse.items);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error===>', error);
    }
  };
  React.useEffect(() => {
    getData();
  }, []);
  console.log('listNews=>', listNews);
  const onPressSave = item => {
    if (listSaved.indexOf(item.id) !== -1) {
      setListSaved(listSaved.filter(x => x !== item.id));
    } else {
      setListSaved([...listSaved, item.id]);
    }
  };
  const renderItem = (item, index) => {
    const {description} = item;
    const imageUrl =
      description && description.indexOf(startOfImage) !== -1
        ? description.substring(
            description.indexOf(startOfImage) + startOfImage.length,
            description.indexOf(endOfImage),
          )
        : 'https://appota.com/static/media/about_vision.a084582e.jpg';
    const isSaved = listSaved.find(x => x === item.id);
    console.log('isSaved=>', isSaved);
    return (
      <TouchableOpacity
        onPress={() => {
          openURL(item.id);
        }}
        activeOpacity={0.8}
        key={item.id}
        style={styles.touchItem}>
        <ImageBackground
          source={{uri: imageUrl}}
          resizeMode="cover"
          style={styles.bgImageItem}
          imageStyle={styles.imageItem}>
          <View style={styles.wrapItem}>
            <View style={styles.bgSafeImage} />
            <TouchableOpacity
              onPress={() => {
                onPressSave(item);
              }}
              style={styles.touchSave}>
              <SaveIcon isSaved={isSaved} />
            </TouchableOpacity>
            <View style={styles.wrapCard}>
              <View style={styles.wrapInfo}>
                <View style={styles.wrapHeaderInfo}>
                  <Text style={styles.txtCate}>TECH</Text>
                  <Text style={styles.txtTimeRead}>7 min read</Text>
                </View>
                <Text style={styles.txtTitle} numberOfLines={3}>
                  {item.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  openURL(item.id);
                }}
                style={styles.btnRead}>
                <Text style={styles.txtRead}>Read</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  const listNewsShow =
    tab === tabKey.saved
      ? listNews.filter(x => listSaved.indexOf(x.id) !== -1)
      : listNews;
  return (
    <View style={styles.container}>
      <View style={styles.wrapHeader}>
        <Text style={styles.txtDate}>
          {moment().format('ddd, MMM DD').toUpperCase()}
        </Text>
        <Text style={styles.txtTabTitle}>World news</Text>
      </View>
      <View style={styles.wrapListNews}>
        {loading ? (
          <View style={styles.wrapLoading}>
            <ActivityIndicator size="large" color={Colors.bgRead} />
          </View>
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={getData} />
            }
            contentContainerStyle={styles.contentWrapScroll}>
            <ScrollView
              snapToAlignment="center"
              snapToInterval={withOfItem}
              disableIntervalMomentum
              pagingEnabled
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contentScroll}
              style={{width: widthWindow}}>
              {listNewsShow.length ? (
                listNewsShow.map(renderItem)
              ) : (
                <View style={styles.wrapLoading}>
                  <Text>No data</Text>
                </View>
              )}
            </ScrollView>
          </ScrollView>
        )}
      </View>
      <View style={styles.containerTab}>
        <TouchableOpacity
          onPress={() => {
            setTab(tabKey.list);
          }}
          style={styles.touchTab}>
          <Image
            source={tab === tabKey.list ? Images.earthActive : Images.earth}
            style={styles.iconTabList}
          />
          <Text
            style={[
              styles.txtTab,
              {color: tab === tabKey.list ? Colors.bgRead : Colors.time},
            ]}>
            Word news
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setTab(tabKey.saved);
          }}
          style={styles.touchTab}>
          <Image
            source={tab === tabKey.saved ? Images.tagSaved : Images.tagSave}
            style={styles.iconTabSave}
          />
          <Text
            style={[
              styles.txtTab,
              {
                color: tab === tabKey.saved ? Colors.bgRead : Colors.time,
              },
            ]}>
            Saved
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  wrapHeader: {
    paddingLeft: 20,
    marginVertical: 20,
    justifyContent: 'center',
  },
  txtDate: {color: Colors.time, fontWeight: 'bold'},
  txtTabTitle: {fontSize: 25, fontWeight: 'bold', color: Colors.black},
  wrapHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  wrapListNews: {paddingBottom: 10, flex: 1},
  txtCate: {
    color: Colors.bgRead,
    fontSize: TextSize.cate,
  },
  txtTimeRead: {
    color: Colors.time,
    fontSize: TextSize.timeRead,
  },
  txtTitle: {
    fontWeight: 'bold',
    color: Colors.black,
    fontSize: TextSize.titleInfo,
    marginBottom: 10,
  },
  touchItem: {
    width: withOfItem,
    paddingLeft: 20,
  },
  bgImageItem: {
    justifyContent: 'flex-end',
    width: withOfImage,
    height: '100%',
    borderRadius: 10,
  },
  imageItem: {
    borderRadius: 10,
  },
  wrapItem: {padding: 10, flex: 1, justifyContent: 'flex-end'},
  wrapCard: {
    backgroundColor: Colors.white,
    borderRadius: 5,
    padding: 15,
    height: '33%',
    minHeight: heightWindow / 3.8,
    justifyContent: 'space-between',
  },
  wrapInfo: {flexShrink: 1},
  btnRead: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: Colors.bgRead,
    borderRadius: 15,
    alignSelf: 'flex-end',
  },
  txtRead: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: TextSize.btnRead,
  },
  touchTab: {
    justifyContent: 'space-evenly',
    height: '100%',
    alignItems: 'center',
  },
  iconTabSave: {width: 50, height: 26},
  iconTabList: {width: 26, height: 26},
  containerTab: {
    height: 80,
    width: widthWindow,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopColor: Colors.time,
    borderTopWidth: 1,
  },
  bgSafeImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.black10,
    borderRadius: 10,
  },
  touchSave: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  contentScroll: {
    paddingRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txtTab: {
    fontSize: TextSize.timeRead,
    fontWeight: 'bold',
  },
  wrapLoading: {
    width: widthWindow,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  contentWrapScroll: {height: '100%'},
});

export default WordNews;
